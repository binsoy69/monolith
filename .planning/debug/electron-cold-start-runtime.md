# Debug Session: Electron Cold Start Runtime

## Symptom

Cold start failed before the app window could open. The first failure was a `better-sqlite3` ABI mismatch against Electron's Node module version, and the next startup attempt exposed Electron running in plain Node mode instead of as an Electron app.

## Root Cause

The development launch path inherited a Node-oriented shell environment. `ELECTRON_RUN_AS_NODE=1` caused Electron to boot as plain Node, while the installed `better-sqlite3` native binary had been built for Node ABI 115 instead of Electron 39 ABI 140.

## Evidence

- `npm run dev` initially failed with `better_sqlite3.node` compiled for `NODE_MODULE_VERSION 115` while Electron required `140`.
- The shell environment exposed `ELECTRON_RUN_AS_NODE=1`, and `npx electron -e "..."` showed `require('electron')` behaving like a plain string path with no `app` object.
- `package.json` used bare `electron-vite dev` / `preview`, so the poisoned environment was passed through unchanged.

## Files Involved

- `package.json`
- `scripts/electron-vite-wrapper.cjs`
- `src/main/index.ts`

## Fix Direction

Clear `ELECTRON_RUN_AS_NODE` before launching Electron entrypoints, rebuild `better-sqlite3` against Electron's headers, and avoid utility imports that assume `electron.app` is always available before the process is confirmed to be running as Electron.
