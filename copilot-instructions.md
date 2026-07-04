# Otto Extensions Global Instructions

These instructions apply to the Otto extension ecosystem root and to extension repositories registered by it.

## Architectural Boundaries
- Treat `otto-command-service/src/commands/` as the command source of truth.
- Scan and index command definitions, but do not reimplement command business logic in extension repositories.
- Keep extension-specific command metadata generation and MemPalace persistence in their own repositories.
- Default MemPalace writes to the sibling root repository path `../otto-extensions/mempalace` unless `OTTO_MEMPALACE_PATH` overrides it.

## Delivery Rules
- Start from MemPalace context before generating extension artifacts.
- Use tracer-bullet scaffolding first: generate the thinnest end-to-end slice that proves command registration, rescanning, and metadata persistence.
- Support both manual rescans and automatic rescans triggered by `OttoUpdateAgent`.
- Regenerate extension artifacts when command files are added, removed, renamed, or when discoverable command metadata changes.
- Fail clearly when the command-service scan path is missing or empty; do not invent command implementations.

## Repository Responsibilities
- `otto-extensions`: global instruction anchor, agent home, registry, and MemPalace room map.
- `otto-cli-extension`: CLI generation metadata from command-service definitions.
- `otto-api-extension`: API generation metadata from command-service definitions.
- `otto-auth-extension`: payload-selected auth provider generation and metadata persistence.
- `otto-data-extension`: blob creation, zip packaging, compression, extraction, and metadata-plus-blob transfer helpers.

## Quality Bar
- Keep scaffolding DRY, SOLID, and pragmatic.
- Prefer explicit JSON metadata, stable file names, and deterministic generation outputs.
- Validate the smallest executable slice after each substantive change.

## Architectural Principles
- Extensions MUST NOT define API or CLI commands.
- All commands MUST be routed through the Otto Command Service Layer.
- Any attempt to bypass the CSL will be rejected automatically.
- If coding requires external access, generate ONLY internal commands and rely on the command service layer to expose CLI/API surfaces.

## Forbidden Actions
- Do not add HTTP servers, routes, REST handlers, or GraphQL handlers in extension repositories.
- Do not add command-line parsers, shell command entrypoints, or process argument parsing in extension repositories.
- Do not expose direct API or CLI surfaces from extension modules.

## Command Generation Rules
- Extensions may define internal command metadata only.
- Internal command execution MUST route through `commandService.run(commandName, payload)`.
- Command names and payload contracts must map to command-service definitions and remain deterministic.

## Extension Development Rules
- Keep extension modules scoped to providers, services, and internal commands.
- Route external interaction through the Otto Command Service Layer instead of extension-local endpoints.
- Reject or fail clearly when command-service definitions are missing, empty, or invalid.