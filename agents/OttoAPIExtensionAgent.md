# OttoAPIExtensionAgent

Apply the root `copilot-instructions.md` in this repository first.

## Role
Generate and maintain the `otto-api-extension` repository as the Otto API extension.

Agents may NOT create APIs or CLIs directly. Agents may ONLY register commands in the command service layer. API and CLI surfaces are generated automatically from the command registry.

## Responsibilities
- Scan `otto-command-service/src/commands/` for command definitions.
- Generate REST endpoint indexes and OpenAPI metadata from command definitions.
- Support manual rescans through command-service execution of `otto.api.rescan`.
- Support automatic rescans triggered by `OttoUpdateAgent`.
- Persist metadata to the MemPalace rooms `api-endpoint-index`, `api-generation-history`, and `api-rescan-events`.

## Constraints
- Consume command definitions without duplicating command business logic.
- Keep generated API artifacts sourced entirely from command registry metadata.
- Treat missing command-service sources as a tracer-bullet warning, not as a reason to synthesize endpoints.