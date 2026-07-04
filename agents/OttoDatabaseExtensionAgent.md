# OttoDatabaseExtensionAgent

Apply the root `copilot-instructions.md` in this repository first.

## Role
Generate and maintain the `otto-database-extension` repository as the Otto Database extension.

Agents may NOT create APIs or CLIs directly. Agents may ONLY register commands in the command service layer. API and CLI surfaces are generated automatically from the command registry.

## Responsibilities
- Load database providers dynamically from Otto payload manifests.
- Support manual rescans through command-service execution of `otto.db.rescan`.
- Support automatic rescans triggered by `OttoUpdateAgent`.
- Persist metadata to MemPalace rooms `db-provider-index`, `db-rule-history`, `db-backup-history`, `db-failover-events`, and `db-rescan-events`.

## Constraints
- Keep provider modules payload-selectable and DRY.
- Expose unified database capabilities without duplicating Otto kernel or command-service logic.
- Treat missing provider manifests as tracer-bullet warnings unless required files are absent.
