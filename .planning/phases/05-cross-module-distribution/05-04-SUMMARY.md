---
phase: 05-cross-module-distribution
plan: 04
subsystem: packaging-and-updates
tags: [packaging, updater, releases, shell-events, windows]
dependency_graph:
  requires:
    - 05-03
  provides:
    - Windows NSIS packaging config for the real Monolith product and GitHub repo
    - packaged-build updater service with renderer shell status events
    - renderer update banner plus a human release checklist for the unsigned v1 ship
  affects: [shell, main-process, preload, packaging, docs]
tech_stack:
  added:
    - electron-updater
  patterns:
    - Updater state crosses the same preload shell bridge family as notification navigation instead of introducing a renderer polling loop
    - Unsigned Windows builds disable executable edit/sign work so local packaging succeeds without elevated symlink privileges
key_files:
  created:
    - src/main/services/AppUpdater.ts
    - src/renderer/shell/UpdateBanner.tsx
    - docs/windows-release.md
    - tests/update-banner.test.tsx
  modified:
    - package.json
    - package-lock.json
    - electron-builder.yml
    - src/shared/ipc-types.ts
    - src/main/index.ts
    - src/preload/index.ts
    - src/renderer/App.tsx
decisions:
  - "Windows packaging keeps `signAndEditExecutable: false` for this unsigned release path so local NSIS builds work without the winCodeSign symlink extraction requirement"
  - "Updater status is renderer-local state driven by preload subscriptions, which keeps the shell responsive without teaching stores about Electron lifecycle events"
requirements-completed: []
metrics:
  completed_date: "2026-03-29"
  tasks_completed: 2
---

# Phase 05 Plan 04: Packaging and Update Summary

Phase 5 now has a concrete Windows distribution path. `electron-builder.yml` targets NSIS for `binsoy69/monolith`, `electron-updater` is wired in packaged builds only, and updater lifecycle events flow through preload into a renderer banner that can trigger `quitAndInstall()`.

The repo also now includes the human release checklist for the unsigned v1 ship. Local verification reached both `build:unpack` and `build:win`, so the remaining work is the credentialed GitHub Release publication path described in `docs/windows-release.md`.

## Verification

- `npm run typecheck`
- `npx vitest run tests/update-banner.test.tsx`
- `npm run build:unpack`
- `npm run build:win`

## Task Commits

- `6cef51e` - electron-updater dependency, builder config, packaged-build updater bridge, renderer update banner, release checklist, and packaging verification

## Remaining Manual Step

- Publish the generated installer and blockmap assets to a draft GitHub Release with `GH_TOKEN`, then smoke-test update checks from the installed app.
