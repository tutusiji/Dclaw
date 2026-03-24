# Dclaw

Dclaw is an Electron desktop shell for customized OpenClaw development. It combines a configurable OpenClaw bridge with local file automation, Office-oriented task runners, and git-based work report generation.

## What it includes

- Electron desktop shell built with `electron-vite`, `React`, and `TypeScript`
- Configurable OpenClaw bridge
  - HTTP mode for local OpenClaw API endpoints
  - Command mode for local wrappers or CLI launchers
- Local automation services in the Electron main process
  - directory inspection
  - text merge
  - CSV merge with optional dedupe keys
  - markdown save pipeline
- Office bridge services
  - Excel merge through `xlsx`
  - Word summary generation through `docx`
  - PPT summary generation through `pptxgenjs`
- Git report generator
  - scan a workspace for repositories
  - generate weekly reports from the current Monday until now
  - generate monthly reports from the first day of the month until now
  - generate custom-range reports
  - filter commits by author

## Project structure

```text
src/
  main/
    index.ts                 Electron main process
    ipc.ts                   IPC registration layer
    services/
      file-service.ts        Local file merge and save logic
      git-report-service.ts  Git scan and weekly/monthly report generation
      office-service.ts      Excel / Word / PPT integrations
      openclaw-bridge.ts     OpenClaw HTTP / command adapter
      process-utils.ts       Shared command runner
  preload/
    index.ts                 Safe bridge exposed to the renderer
  renderer/
    index.html
    src/
      App.tsx                Main workbench UI
      components/Panel.tsx   Shared panel wrapper
      styles.css             UI theme
  shared/
    types.ts                 Shared contracts across layers
```

## Development

```bash
pnpm install
pnpm dev
```

Build:

```bash
pnpm build
```

Package:

```bash
pnpm package
```

## How to integrate the real OpenClaw

### HTTP mode

Point Dclaw at a running OpenClaw-compatible local API:

- `Base URL`: for example `http://127.0.0.1:6917`
- `Request path`: for example `/api/tasks`
- `Payload`: any JSON body required by the target service

### Command mode

Point Dclaw at a local wrapper script or binary:

- `Binary path`: your OpenClaw launcher
- `Working directory`: the repo or runtime directory
- `Default args`: fixed arguments loaded on every execution

When running in command mode, Dclaw injects the task payload into `DCLAW_TASK_PAYLOAD`, so a wrapper script can parse it and forward it to the real OpenClaw process.

## Suggested next steps

- replace the generic `/api/tasks` request with the real OpenClaw API contract
- add plugin-style task registries for local abilities such as file parsing, batch transforms, and data cleanup
- add richer work report templates for weekly, monthly, and project-specific report formats
- connect Word/PPT generation directly to git report output for one-click report export
- add permission prompts or allowlists if the desktop client will be used by non-technical users

## Notes

- Office features depend on optional packages listed in `package.json`.
- If you want Dclaw to control Word, Excel, or PowerPoint through platform-native automation instead of file-generation libraries, add that in the Electron main process as a separate capability provider.
- This workspace did not contain the main OpenClaw repository, so the current bridge is intentionally generic and ready to be wired to the actual OpenClaw API or launcher that you use.
