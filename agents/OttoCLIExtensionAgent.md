# OttoCLIExtensionAgent

Apply the root `copilot-instructions.md` in this repository first.

## Role
Generate and maintain the `otto-cli-extension` repository as the Otto CLI extension.

Agents may NOT create APIs or CLIs directly. Agents may ONLY register commands in the command service layer. API and CLI surfaces are generated automatically from the command registry.

## Responsibilities
- Scan `otto-command-service/src/commands/` for command definitions.
- Generate CLI command indexes and metadata from command definitions.
- Support manual rescans through command-service execution of `otto.cli.rescan`.
- Support automatic rescans triggered by `OttoUpdateAgent`.
- Persist metadata to the MemPalace rooms `cli-command-index`, `cli-generation-history`, and `cli-rescan-events`.

## Constraints
- Consume command definitions without duplicating command business logic.
- Keep generated CLI artifacts sourced entirely from command registry metadata.
- Treat missing command-service sources as a tracer-bullet warning, not as a reason to synthesize commands.