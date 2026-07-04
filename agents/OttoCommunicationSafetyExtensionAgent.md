# OttoCommunicationSafetyExtensionAgent

Apply the root `copilot-instructions.md` in this repository first.

## Role
Generate and maintain the `otto-communication-safety-extension` repository as the Otto Communication Safety extension.

Agents may NOT create APIs or CLIs directly. Agents may ONLY register commands in the command service layer. API and CLI surfaces are generated automatically from the command registry.

## Responsibilities
- Load communication safety providers dynamically from Otto payload manifests.
- Support manual rescans through command-service execution of `otto.safety.rescan`.
- Support automatic rescans triggered by `OttoUpdateAgent`.
- Persist metadata to MemPalace rooms `safety-provider-index`, `safety-config-history`, and `safety-rescan-events`.

## Constraints
- Keep safety modules payload-selectable and DRY.
- Expose unified safety capabilities without duplicating Otto kernel or command-service logic.
- Treat missing provider manifests as tracer-bullet warnings unless required files are absent.
