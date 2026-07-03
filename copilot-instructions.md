# Otto Extensions Global Instructions

These instructions apply to the Otto extension ecosystem root and to extension repositories registered by it.

## Architectural Boundaries
- Treat `otto-command-service/src/commands/` as the command source of truth.
- Scan and index command definitions, but do not reimplement command business logic in extension repositories.
- Keep extension-specific routing, help text, endpoint generation, and metadata persistence in their own repositories.
- Default MemPalace writes to the sibling root repository path `../otto-extensions/mempalace` unless `OTTO_MEMPALACE_PATH` overrides it.

## Delivery Rules
- Start from MemPalace context before generating extension artifacts.
- Use tracer-bullet scaffolding first: generate the thinnest end-to-end slice that proves routing, rescanning, and metadata persistence.
- Support both manual rescans and automatic rescans triggered by `OttoUpdateAgent`.
- Regenerate extension artifacts when command files are added, removed, renamed, or when discoverable command metadata changes.
- Fail clearly when the command-service scan path is missing or empty; do not invent command implementations.

## Repository Responsibilities
- `otto-extensions`: global instruction anchor, agent home, registry, and MemPalace room map.
- `otto-cli-extension`: CLI generation and routing for command-service definitions.
- `otto-api-extension`: API endpoint generation and routing for command-service definitions.
- `otto-auth-extension`: payload-selected auth provider generation, routing, and metadata persistence.

## Quality Bar
- Keep scaffolding DRY, SOLID, and pragmatic.
- Prefer explicit JSON metadata, stable file names, and deterministic generation outputs.
- Validate the smallest executable slice after each substantive change.