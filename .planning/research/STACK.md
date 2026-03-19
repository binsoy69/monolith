# Technology Stack

**Project:** Monolith — Electron + React Desktop Productivity App
**Researched:** 2026-03-19
**Research tools used:** Training data (cutoff Aug 2025). WebSearch, WebFetch, and Bash were unavailable in this session. Versions should be verified against npm/official docs before locking in.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Electron | ^34.x | Desktop shell — OS integration, window management, native APIs | Latest stable as of early 2026. Chromium v132+, Node.js v22. Security model has matured significantly since v20+. [MEDIUM confidence — verify on npmjs.com/package/electron] |
| React | ^19.x | UI rendering layer | React 19 is stable (released Dec 2024). Concurrent features, useTransition, and the new compiler make it well-suited for dense, interactive UIs where instant feedback matters. |
| TypeScript | ^5.7.x | Type safety across main + renderer processes | Process boundary mistakes (calling Node APIs from renderer) are caught at compile time. Non-negotiable for a multi-process architecture. |

### Build Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| electron-vite | ^3.x | Dev server + build pipeline | **Best choice for this project.** electron-vite wraps Vite and provides out-of-box config for Electron's main/preload/renderer three-process architecture. Hot reload works correctly across all three. Alternative: Electron Forge (official, more complex, heavier). electron-vite is simpler, faster, and has better DX for a React setup. [MEDIUM confidence — verify current version] |
| Vite | ^6.x (peer dep of electron-vite) | Renderer build | HMR is instant. esbuild-based transforms. No config needed — electron-vite handles it. |

### Database

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| better-sqlite3 | ^9.x | SQLite driver for Node.js (main process) | Synchronous API is correct for Electron's main process — no async overhead, no Promise chains for simple CRUD. Fastest SQLite binding for Node. Actively maintained. WAL mode enabled by default. [HIGH confidence] |
| Drizzle ORM | ^0.40.x | Schema definition, query builder, migrations | **Best choice over Prisma for Electron.** Drizzle is lightweight, has zero runtime overhead, generates type-safe SQL, and its migration system (drizzle-kit) generates plain SQL files you control. Prisma requires a query engine binary and has historically been awkward in Electron due to binary packaging. Drizzle compiles away entirely — nothing to package. [MEDIUM confidence — verify drizzle-orm current version] |

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zustand | ^5.x | Client-side UI state (current view, selected items, modal state) | Minimal boilerplate, no Provider wrapping, works naturally with React 19. For a single-user local app, you don't need Redux's complexity. Zustand slices map cleanly to the three modules (habits, planner, expenses). [HIGH confidence] |
| TanStack Query | ^5.x | Server-state bridge — IPC → React data layer | Caches SQLite query results in memory, handles background refetches after mutations, provides loading/error states. Even though your "server" is the main process over IPC, TanStack Query's pattern (queries + mutations) is the right abstraction. Without it, you'll hand-roll stale data logic. [HIGH confidence] |

### IPC Layer

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Electron contextBridge + ipcRenderer/ipcMain | Built-in | Secure main ↔ renderer communication | The only correct pattern post-Electron v12. `contextBridge.exposeInMainWorld` exposes a typed API to the renderer without enabling `nodeIntegration`. All SQLite calls live in main, all UI lives in renderer — the bridge is the contract. |
| Typed IPC pattern (hand-rolled or electron-trpc) | — | Type-safe IPC contracts | Either define a shared TypeScript interface for your IPC handlers, or use electron-trpc (wraps tRPC over IPC). For this app's scale, a hand-rolled typed interface is sufficient and avoids a dependency. electron-trpc is worth considering if IPC grows complex. [MEDIUM confidence] |

### UI & Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | ^4.x | Utility-first styling | Tailwind v4 drops the config file for a CSS-based config — simpler setup. For a dense, custom design that must NOT look generic, Tailwind gives control without fighting a component library's opinions. Critical: do NOT use a pre-built component library (shadcn/ui clones, Ant Design, MUI) — they produce the exact "AI-looking generic" aesthetic the project explicitly rejects. [MEDIUM confidence on v4 stability — verify] |
| CSS custom properties | — | Design tokens (colors, spacing, typography) | Define a dark-theme token system in CSS variables. Enables consistent density and a handcrafted feel. One `globals.css` with your full token set. |
| Recharts | ^2.x | Charts (habit streaks, expense summaries) | Declarative React charting. Recharts is composable and styleable — you control colors, grids, tooltips. Alternatives: Victory (heavier), Chart.js (imperative, non-React). For a dark dense UI, Recharts' SVG output is easier to theme than Canvas-based libs. [HIGH confidence] |

### Notifications

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Electron Notification API | Built-in | Desktop notifications for unchecked habits | `new Notification()` via Electron's main process. No third-party lib needed. Schedule via `node-cron` or `setInterval` in main. |
| node-cron | ^3.x | Scheduling daily habit reminders | Runs in main process. Lightweight cron-style scheduler. No daemon needed — Electron keeps the process alive. [HIGH confidence] |

### Dev Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| ESLint | ^9.x | Linting | Flat config (ESLint v9+). Add `eslint-plugin-react`, `typescript-eslint`. |
| Prettier | ^3.x | Code formatting | No opinions needed — standard config. |
| Vitest | ^3.x | Unit testing | Vite-native test runner. Runs without Electron, so unit tests for business logic (streak calculation, expense totals) are fast. Do NOT use Jest — Vitest is the correct choice in a Vite project. [HIGH confidence] |
| Playwright | ^1.x | E2E testing (optional, Phase N+) | Has Electron support via `electronApplication`. Worth knowing exists but likely deferred. |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Build tool | electron-vite | Electron Forge | Forge is more complex, slower HMR, requires more config for a Vite+React setup. electron-vite is purpose-built for this exact scenario. |
| Build tool | electron-vite | Create React App | Dead. Unmaintained. Do not use. |
| ORM | Drizzle | Prisma | Prisma requires a native query engine binary that must be correctly packaged for distribution. Historically problematic in Electron. Drizzle has zero runtime, compiles away entirely. |
| ORM | Drizzle | Sequelize | Dated API, TypeScript support is bolted-on, async-only. Worse than Drizzle in every dimension for this use case. |
| State | Zustand | Redux Toolkit | RTK is excellent but overkill for a single-user local app with no complex action choreography. Zustand achieves the same with 80% less boilerplate. |
| State | Zustand | Jotai | Jotai's atom model works well but requires more mental overhead for co-located module state. Zustand slices map better to the three-module structure. |
| UI | Custom Tailwind | shadcn/ui | shadcn/ui components produce a recognizable look. The project explicitly requires a non-generic aesthetic. Use it for internal logic patterns (cmdk for command palette) but not for visual design. |
| UI | Custom Tailwind | MUI / Ant Design | Heavy, opinionated, produce generic-looking UIs. The project's aesthetic requirement rules these out completely. |
| Charts | Recharts | D3.js | D3 gives maximum control but requires significant implementation time. Recharts wraps D3 in React components — right tradeoff for this scope. |
| SQLite driver | better-sqlite3 | sql.js | sql.js runs SQLite in WebAssembly — runs in the renderer, no persistence without serialization. better-sqlite3 runs natively in main, persists to disk. No contest. |
| SQLite driver | better-sqlite3 | node-sqlite3 (sqlite3 pkg) | Async API is unnecessary overhead for single-user queries. better-sqlite3 is synchronous, faster, and has a better API. |

---

## Architecture Notes (relevant to stack)

**Process boundaries:**
- Main process: SQLite (better-sqlite3 + Drizzle), notifications, cron scheduling, file system access
- Renderer process: React UI, Zustand state, TanStack Query cache
- Preload script: contextBridge API — the typed contract between processes

**IPC data flow:**
```
Renderer → ipcRenderer.invoke('habits:getToday')
  → Preload exposes via contextBridge
  → Main ipcMain.handle('habits:getToday')
  → better-sqlite3 query
  → returns typed result
```

TanStack Query wraps `ipcRenderer.invoke` calls as query functions. Mutations call `ipcRenderer.invoke` then invalidate the relevant query. This pattern eliminates hand-rolled cache invalidation logic entirely.

---

## Installation

```bash
# Bootstrap with electron-vite React TypeScript template
npm create @quick-start/electron@latest monolith -- --template react-ts

# Core runtime dependencies
npm install better-sqlite3 drizzle-orm zustand @tanstack/react-query recharts tailwindcss node-cron

# Drizzle CLI (migrations)
npm install -D drizzle-kit

# Tailwind v4 PostCSS setup
npm install -D @tailwindcss/vite

# Types
npm install -D @types/better-sqlite3 @types/node-cron

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Linting
npm install -D eslint typescript-eslint eslint-plugin-react prettier
```

> Note: `better-sqlite3` is a native Node module. electron-vite handles native module rebuilding via `electron-rebuild` in the template. Verify the template includes this step or add it manually.

---

## Confidence Flags

| Decision | Confidence | What to Verify |
|----------|------------|----------------|
| Electron 34.x as latest | MEDIUM | Check npmjs.com/package/electron for actual latest |
| electron-vite ^3.x | MEDIUM | Check electron-vite.org for current version + React 19 compat |
| Drizzle ORM ^0.40.x | MEDIUM | Check npmjs.com/package/drizzle-orm for current version |
| Tailwind CSS v4 stability | MEDIUM | v4 was in RC as of mid-2025; verify it's stable and has PostCSS/Vite plugin |
| better-sqlite3 in Electron | HIGH | Well-established pattern, widely documented |
| Zustand v5 | HIGH | Released 2024, stable |
| TanStack Query v5 | HIGH | Stable since late 2023 |
| Recharts v2 | HIGH | Stable, widely used |
| Drizzle over Prisma in Electron | HIGH | Multiple community posts confirm Prisma binary packaging issues in Electron |

---

## Sources

- Training data (cutoff August 2025)
- PROJECT.md requirements analysis
- NOTE: All version numbers and library choices should be verified against official npm registry and project documentation before implementation begins. WebSearch and WebFetch were unavailable during this research session.
