#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execSync } from "node:child_process";

const workspaceRoot = process.env.OTTO_WORKSPACE_ROOT
  ? path.resolve(process.env.OTTO_WORKSPACE_ROOT)
  : path.resolve(process.cwd(), "..");
const rootRepo = path.join(workspaceRoot, "otto-extensions");

const repositories = [
  { name: "otto-extensions", localPath: path.join(workspaceRoot, "otto-extensions") },
  { name: "otto-cli-extension", localPath: path.join(workspaceRoot, "otto-cli-extension") },
  { name: "otto-api-extension", localPath: path.join(workspaceRoot, "otto-api-extension") }
];

const requiredFiles = [
  "otto-extensions/copilot-instructions.md",
  "otto-extensions/agents/OttoCLIExtensionAgent.md",
  "otto-extensions/agents/OttoAPIExtensionAgent.md",
  "otto-extensions/registry/extension-registry.json",
  "otto-cli-extension/manifests/extension.json",
  "otto-cli-extension/src/cli-generator.ts",
  "otto-cli-extension/src/cli-router.ts",
  "otto-cli-extension/src/cli-help.ts",
  "otto-cli-extension/src/cli-rescan.ts",
  "otto-api-extension/manifests/extension.json",
  "otto-api-extension/src/api-generator.ts",
  "otto-api-extension/src/api-router.ts",
  "otto-api-extension/src/api-schemas.ts",
  "otto-api-extension/src/api-rescan.ts"
];

function run(command, cwd) {
  return execSync(command, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"]
  })
    .toString()
    .trim();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function assertRepositoriesExist() {
  for (const repository of repositories) {
    if (!fs.existsSync(repository.localPath)) {
      throw new Error(`Local repository is missing: ${repository.localPath}`);
    }
  }
}

function validateRequiredScaffolding() {
  const result = [];
  for (const relPath of requiredFiles) {
    const absolutePath = path.join(workspaceRoot, relPath);
    const exists = fs.existsSync(absolutePath);
    result.push({ path: relPath, exists });
  }

  const missing = result.filter((entry) => !entry.exists);
  if (missing.length > 0) {
    const list = missing.map((entry) => entry.path).join(", ");
    throw new Error(`Required scaffolding is missing: ${list}`);
  }

  return result;
}

function buildRepositoryState(now) {
  const syncIndex = {
    generatedAt: now,
    organization: "otto-extensions",
    syncStatus: "synchronized",
    repositories: []
  };
  const commitMetadata = {
    generatedAt: now,
    commits: []
  };
  const remoteMetadata = {
    generatedAt: now,
    remotes: []
  };
  const versionMetadata = {
    generatedAt: now,
    versions: []
  };

  for (const repository of repositories) {
    const branch = run("git rev-parse --abbrev-ref HEAD", repository.localPath);
    const commit = run("git rev-parse HEAD", repository.localPath);
    const remote = run("git remote get-url origin", repository.localPath);
    const status = run("git status --short", repository.localPath);
    const remoteInfo = JSON.parse(
      run(
        `gh repo view otto-extensions/${repository.name} --json url,visibility,defaultBranchRef`,
        repository.localPath
      )
    );

    const manifestPath = path.join(repository.localPath, "manifests", "extension.json");
    const packagePath = path.join(repository.localPath, "package.json");

    syncIndex.repositories.push({
      repository: repository.name,
      localPath: repository.localPath,
      branch,
      commit,
      remote,
      remoteUrl: remoteInfo.url,
      visibility: remoteInfo.visibility,
      defaultBranch: remoteInfo.defaultBranchRef?.name ?? null,
      workingTreeClean: status.length === 0,
      synced: true
    });

    commitMetadata.commits.push({
      repository: repository.name,
      branch,
      commit,
      capturedAt: now
    });

    remoteMetadata.remotes.push({
      repository: repository.name,
      remote: "origin",
      url: remote,
      publicUrl: remoteInfo.url,
      visibility: remoteInfo.visibility,
      defaultBranch: remoteInfo.defaultBranchRef?.name ?? null
    });

    versionMetadata.versions.push({
      repository: repository.name,
      manifestVersion: fs.existsSync(manifestPath) ? readJson(manifestPath).version ?? null : null,
      packageVersion: fs.existsSync(packagePath) ? readJson(packagePath).version ?? null : null
    });
  }

  return {
    syncIndex,
    commitMetadata,
    remoteMetadata,
    versionMetadata
  };
}

function buildRegistryMetadata(now) {
  const registryPath = path.join(rootRepo, "registry", "extension-registry.json");
  const registry = readJson(registryPath);

  return {
    generatedAt: now,
    registryPath,
    extensionCount: Array.isArray(registry.extensions) ? registry.extensions.length : 0,
    extensionIds: Array.isArray(registry.extensions) ? registry.extensions.map((entry) => entry.id) : [],
    schemaVersion: registry.schemaVersion ?? null
  };
}

function main() {
  assertRepositoriesExist();
  const scaffolding = validateRequiredScaffolding();

  const now = new Date().toISOString();
  const mempalaceDir = path.join(rootRepo, "mempalace");
  fs.mkdirSync(mempalaceDir, { recursive: true });

  const state = buildRepositoryState(now);
  const registryMetadata = buildRegistryMetadata(now);

  writeJson(path.join(mempalaceDir, "repo-sync-index.json"), state.syncIndex);
  writeJson(path.join(mempalaceDir, "repo-commit-metadata.json"), state.commitMetadata);
  writeJson(path.join(mempalaceDir, "repo-remote-urls.json"), state.remoteMetadata);
  writeJson(path.join(mempalaceDir, "repo-version-metadata.json"), state.versionMetadata);
  writeJson(path.join(mempalaceDir, "extension-registry-metadata.json"), registryMetadata);

  const report = {
    generatedAt: now,
    synchronizedRepositories: state.syncIndex.repositories.map((entry) => entry.repository),
    scaffoldingValidated: scaffolding.length,
    outputFiles: [
      "mempalace/repo-sync-index.json",
      "mempalace/repo-commit-metadata.json",
      "mempalace/repo-remote-urls.json",
      "mempalace/repo-version-metadata.json",
      "mempalace/extension-registry-metadata.json"
    ]
  };

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

main();