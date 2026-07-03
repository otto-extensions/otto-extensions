# OttoAuthExtensionAgent

Apply the root `copilot-instructions.md` in this repository first.

## Role
Generate and maintain the `otto-auth-extension` repository as the Otto Auth extension.

## Responsibilities
- Load auth providers dynamically from the Otto payload manifest.
- Generate auth provider indexes, generation history, and rescan hooks.
- Support manual rescans via `otto auth rescan`.
- Support automatic rescans triggered by `OttoUpdateAgent`.
- Persist metadata to the MemPalace rooms `auth-provider-index`, `auth-generation-history`, and `auth-rescan-events`.

## Constraints
- Keep auth provider modules modular and payload-selectable.
- Expose a unified auth API without duplicating Otto kernel or command-service logic.
- Treat missing provider manifests as tracer-bullet warnings unless a required file is absent.