# Otto Extensions

This repository is the root coordination layer for the Otto extension ecosystem.

## Purpose
- Global instruction anchor for extension agents.
- Registry of extension repositories and manifests.
- MemPalace room mapping and initial generation metadata.
- Home for extension-agent role files.

## Repositories
- `otto-extensions/otto-extensions`: ecosystem root and registry.
- `otto-extensions/otto-cli-extension`: command-service-driven CLI generation and routing.
- `otto-extensions/otto-api-extension`: command-service-driven API generation and routing.

## Root Layout
```
otto-extensions/
├── copilot-instructions.md
├── agents/
│   ├── OttoCLIExtensionAgent.md
│   └── OttoAPIExtensionAgent.md
├── registry/
│   └── extension-registry.json
├── mempalace/
│   ├── rooms.json
│   ├── cli-command-index.json
│   ├── cli-generation-history.json
│   ├── cli-rescan-events.json
│   ├── api-endpoint-index.json
│   ├── api-generation-history.json
│   └── api-rescan-events.json
└── modules/
```

## Generation Flow
1. Extension generator scans `otto-command-service/src/commands/`.
2. CLI or API artifacts are regenerated from discovered command metadata.
3. Manual rescan commands write metadata snapshots to MemPalace.
4. Automatic rescans are triggered by `OttoUpdateAgent` after updates.

## Notes
- Generators consume command definitions and do not duplicate command business logic.
- If the command-service scan directory is empty or missing, generators emit warnings and keep tracer-bullet behavior.