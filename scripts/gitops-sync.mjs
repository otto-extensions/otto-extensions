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
  { name: "otto-api-extension", localPath: path.join(workspaceRoot, "otto-api-extension") },
  { name: "otto-auth-extension", localPath: path.join(workspaceRoot, "otto-auth-extension") },
  { name: "otto-telemetry-extension", localPath: path.join(workspaceRoot, "otto-telemetry-extension") },
  { name: "otto-database-extension", localPath: path.join(workspaceRoot, "otto-database-extension") },
  { name: "otto-communication-safety-extension", localPath: path.join(workspaceRoot, "otto-communication-safety-extension") }
];

const requiredFiles = [
  "otto-extensions/copilot-instructions.md",
  "otto-extensions/agents/OttoCLIExtensionAgent.md",
  "otto-extensions/agents/OttoAPIExtensionAgent.md",
  "otto-extensions/agents/OttoAuthExtensionAgent.md",
  "otto-extensions/agents/OttoTelemetryExtensionAgent.md",
  "otto-extensions/agents/OttoDatabaseExtensionAgent.md",
  "otto-extensions/agents/OttoCommunicationSafetyExtensionAgent.md",
  "otto-extensions/registry/extension-registry.json",
  "otto-cli-extension/manifests/extension.json",
  "otto-cli-extension/src/cli-generator.ts",
  "otto-cli-extension/src/cli-rescan.ts",
  "otto-api-extension/manifests/extension.json",
  "otto-api-extension/src/api-generator.ts",
  "otto-api-extension/src/api-rescan.ts",
  "otto-auth-extension/manifests/extension.json",
  "otto-auth-extension/manifests/providers.json",
  "otto-auth-extension/src/auth-core.ts",
  "otto-auth-extension/src/provider-loader.ts",
  "otto-auth-extension/src/auth-rescan.ts",
  "otto-telemetry-extension/manifests/extension.json",
  "otto-telemetry-extension/manifests/telemetry-providers.json",
  "otto-telemetry-extension/src/telemetry-core.ts",
  "otto-telemetry-extension/src/progress-tracker.ts",
  "otto-telemetry-extension/src/eta-calculator.ts",
  "otto-telemetry-extension/src/throughput-calculator.ts",
  "otto-telemetry-extension/src/provider-loader.ts",
  "otto-telemetry-extension/src/telemetry-rescan.ts",
  "otto-database-extension/manifests/extension.json",
  "otto-database-extension/src/db-core.ts",
  "otto-database-extension/src/provider-loader.ts",
  "otto-database-extension/src/db-rescan.ts",
  "otto-communication-safety-extension/manifests/extension.json",
  "otto-communication-safety-extension/src/safety-core.ts",
  "otto-communication-safety-extension/src/provider-loader.ts",
  "otto-communication-safety-extension/src/safety-rescan.ts"
];

function run(command, cwd) {
  return execSync(command, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"]
  })
    .toString()
    .trim();
}

function runOrNull(command, cwd) {
  try {
    return run(command, cwd);
  } catch {
    return null;
  }
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
    const branch = runOrNull("git rev-parse --abbrev-ref HEAD", repository.localPath);
    const commit = runOrNull("git rev-parse --verify HEAD", repository.localPath);
    const remote = runOrNull("git remote get-url origin", repository.localPath);
    const status = runOrNull("git status --short", repository.localPath) ?? "";
    const remoteInfoRaw = remote
      ? runOrNull(
          `gh repo view otto-extensions/${repository.name} --json url,visibility,defaultBranchRef`,
          repository.localPath
        )
      : null;
    const remoteInfo = remoteInfoRaw ? JSON.parse(remoteInfoRaw) : null;

    const manifestPath = path.join(repository.localPath, "manifests", "extension.json");
    const packagePath = path.join(repository.localPath, "package.json");

    syncIndex.repositories.push({
      repository: repository.name,
      localPath: repository.localPath,
      branch,
      commit,
      remote,
      remoteUrl: remoteInfo?.url ?? null,
      visibility: remoteInfo?.visibility ?? null,
      defaultBranch: remoteInfo?.defaultBranchRef?.name ?? null,
      workingTreeClean: status.length === 0,
      synced: Boolean(branch && commit && remoteInfo)
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
      publicUrl: remoteInfo?.url ?? null,
      visibility: remoteInfo?.visibility ?? null,
      defaultBranch: remoteInfo?.defaultBranchRef?.name ?? null
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