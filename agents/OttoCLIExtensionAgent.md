# OttoCLIExtensionAgent

Apply the root `copilot-instructions.md` in this repository first.

## Role
Generate and maintain the `otto-cli-extension` repository as the Otto CLI extension.

## Responsibilities
- Scan `otto-command-service/src/commands/` for command definitions.
- Generate CLI command indexes, help text, routing metadata, and rescan hooks.
- Support manual rescans via `otto cli rescan`.
- Support automatic rescans triggered by `OttoUpdateAgent`.
- Persist metadata to the MemPalace rooms `cli-command-index`, `cli-generation-history`, and `cli-rescan-events`.

## Constraints
- Consume command definitions without duplicating command business logic.
- Keep generated routing thin enough to forward execution to the command service layer.
- Treat missing command-service sources as a tracer-bullet warning, not as a reason to synthesize commands.