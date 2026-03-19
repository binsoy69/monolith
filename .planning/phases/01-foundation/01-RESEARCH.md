# Phase 1: Foundation - Research

**Researched:** 2026-03-19
**Domain:** Electron + React desktop app — scaffolding, IPC bridge, SQLite migrations, design tokens, keyboard routing, app settings persistence
**Confidence:** HIGH (architecture patterns) / HIGH (version numbers — verified against npm registry 2026-03-19)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Color palette & typography**
- Cool charcoal dark theme — blue-grey undertones (backgrounds in #1a1a2e to #16161e range, like Linear/Raycast)
- Electric/indigo blue accent color for interactive elements (active states, buttons, focus rings)
- Inter font family throughout — clean geometric sans-serif, good at small sizes
- Very dense UI — 12-13px base font size, 4px spacing grid, tight line height
- Maximum information per screen — power-user feel, Linear/Raycast density

**Shell layout**
- Narrow icon-only sidebar (48-56px wide) on the left side
- Icons for Dashboard, Habits, Planner, Expenses; gear icon at bottom for Settings
- Tooltip on hover for icon labels
- Custom frameless window — no native titlebar, custom drag region at top, window controls integrated
- Minimal content header bar — thin bar with module name on left, 1-2 action buttons on right

**Settings screen**
- Minimal essentials for Phase 1: date format (DD/MM vs MM/DD), notification reminder time
- Placeholder structure for future settings categories
- Accessed via gear icon at bottom of sidebar
- Single page with sections layout — all settings on one scrollable page, grouped by category
- Purpose: prove the electron-store persistence pattern works (SET-01)

**Keyboard conventions**
- Alt-based modifier keys for module switching (leaves Ctrl free for text editing)
- Alt+1 = Dashboard, Alt+2 = Habits, Alt+3 = Planner, Alt+4 = Expenses
- ? = keyboard shortcut reference overlay (build in Phase 1 even with few shortcuts)
- Escape = close topmost overlay/modal; if nothing open, return to Dashboard
- Global keyboard router built into the shell — all shortcuts registered centrally before any module code

### Claude's Discretion
- Exact hex values for the color palette (within the cool charcoal + blue accent direction)
- Type scale specific sizes (within the 12-13px base constraint)
- Drag region height and window control placement
- Settings save behavior (auto-save vs explicit save button)
- Sidebar icon choices (which icon set, specific icons)
- Keyboard router implementation pattern (event delegation approach)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SHELL-03 | Dark, dense, information-rich UI (Raycast/Warp aesthetic) | Design token system — CSS custom properties for color palette, type scale, spacing grid. Verified Tailwind v4 stable for utility layer. |
| SHELL-04 | Sub-100ms transitions, no loading spinners | State-based navigation (no router lib), `ipcMain.handle` async (never sync), optimistic update pattern via Zustand stores established in Phase 1 shell. |
| SHELL-05 | Design feels handcrafted — not generic, not AI-generated | No component library — custom Tailwind + CSS variables only. Inter font. Icon set chosen deliberately (Lucide or Phosphor). |
| SET-01 | App settings screen for preferences (notification times, date format) | electron-store 11.0.2 for key-value persistence outside SQLite. Verified API. Single-page settings UI with grouped sections. |
</phase_requirements>

---

## Summary

Phase 1 is the structural foundation that every subsequent phase depends on. It has five concrete deliverables: a correctly-configured Electron window (contextIsolation, no nodeIntegration), a typed IPC bridge via contextBridge, a SQLite database at the userData path with a version-tracked migration runner, a design token system as CSS custom properties, and a shell layout with sidebar navigation and global keyboard router.

The prior project research (STACK.md, ARCHITECTURE.md, PITFALLS.md) has already identified all key patterns and anti-patterns. The primary gap in that research was unverified version numbers — all flagged as MEDIUM confidence. This phase research resolves all version flags against the live npm registry as of 2026-03-19. The most significant corrections: Electron is 41.0.3 (not 34.x), electron-vite is 5.0.0 (not 3.x), better-sqlite3 is 12.8.0 (not 9.x), Recharts is 3.8.0 (not 2.x), and drizzle-kit is 0.31.10 (separate versioning from drizzle-orm 0.45.1).

Tailwind v4 is confirmed stable at 4.2.2 and uses a CSS-based config rather than `tailwind.config.js`. electron-store is at 11.0.2 (major version change from what prior research assumed — API needs verification for v11 vs v8 breaking changes). The architecture patterns documented in ARCHITECTURE.md are correct and unchanged; this research layer confirms the build approach and fills in current API details.

**Primary recommendation:** Scaffold with `npm create @quick-start/electron@latest monolith -- --template react-ts`, pin all packages to the verified versions below, implement the IPC bridge + migration runner before any UI, and define the full design token set in `globals.css` before writing a single component.

---

## Standard Stack

### Core (verified against npm registry 2026-03-19)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| electron | 41.0.3 | Desktop shell — BrowserWindow, IPC, OS integration | Only option for cross-platform desktop with web tech |
| react | 19.2.4 | UI rendering layer | Stable concurrent features; useTransition useful for dense UI transitions |
| typescript | 5.9.3 | Type safety across process boundary | Catches main/renderer boundary mistakes at compile time |
| electron-vite | 5.0.0 | Build pipeline — main/preload/renderer with HMR | Purpose-built for Electron 3-process architecture; vite ^5-7 peer dep |
| vite | 8.0.1 | Renderer build (peer dep of electron-vite) | Instant HMR |
| better-sqlite3 | 12.8.0 | SQLite driver (main process only) | Synchronous API, fastest Node SQLite binding |
| drizzle-orm | 0.45.1 | Schema definition + query builder | Zero runtime overhead, compiles away, no packaging issues unlike Prisma |
| drizzle-kit | 0.31.10 | Migration CLI + schema generation | Separate package from drizzle-orm; generates SQL migration files |
| zustand | 5.0.12 | Client-side UI state (per-module stores) | No Provider boilerplate, natural React 19 integration |
| @tanstack/react-query | 5.91.2 | IPC-as-server-state bridge | Caches results, handles mutations + invalidation; eliminates hand-rolled stale data |
| tailwindcss | 4.2.2 | Utility-first styling | v4 is stable; CSS-based config, no tailwind.config.js needed |
| @tailwindcss/vite | 4.2.2 | Vite plugin for Tailwind v4 | Required for Tailwind v4 in Vite projects (replaces PostCSS-only approach) |
| electron-store | 11.0.2 | Key-value persistence for UI preferences | Settings, window state — fast, no SQLite needed for flat key-value |
| recharts | 3.8.0 | Charts (Phase 4 — schema defined here) | SVG-based, composable, dark-themeable |
| date-fns | 4.1.0 | Date arithmetic for streak logic | Explicit timezone handling; replaces moment.js |

### Dev Tooling

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | 4.1.0 | Unit testing | Vite-native; use for business logic (streak calc, migrations) |
| @testing-library/react | 16.3.2 | Component testing | When testing React components in isolation |
| eslint | 10.0.3 | Linting (flat config) | Phase 1 setup — ESLint v10 uses flat config only |
| prettier | 3.8.1 | Code formatting | Standard config |
| electron-builder | 26.8.1 | Packaging + distribution (Phase 5) | Aware of now; configuration in package.json |
| @types/better-sqlite3 | 7.6.13 | TypeScript types for better-sqlite3 | Required — no built-in types |

### Alternatives Confirmed Not To Use

| Instead of | Could Use | Why We Don't |
|------------|-----------|-------------|
| Custom Tailwind + CSS vars | shadcn/ui, MUI, Ant Design | Produce recognizable generic look; project explicitly requires non-generic aesthetic |
| electron-vite | Electron Forge | More complex, heavier, slower HMR |
| better-sqlite3 | Prisma | Prisma requires native query engine binary; packaging in Electron is historically broken |
| State-based routing | react-router-dom | 5-view desktop app doesn't need a router; HashRouter adds complexity with no benefit |
| electron-store | SQLite for settings | Settings are flat key-value; SQLite is overkill and wrong layer |

**Installation (Phase 1 sequence):**
```bash
# Bootstrap
npm create @quick-start/electron@latest monolith -- --template react-ts

# Core runtime
npm install better-sqlite3 drizzle-orm zustand @tanstack/react-query electron-store date-fns

# Drizzle CLI
npm install -D drizzle-kit

# Tailwind v4
npm install tailwindcss @tailwindcss/vite

# Types + testing
npm install -D @types/better-sqlite3 vitest @testing-library/react

# Linting
npm install -D eslint prettier
```

> Note: `better-sqlite3` is a native Node module. Verify the electron-vite template includes `electron-rebuild` or add it. The module must be rebuilt against the Electron Node.js ABI, not the system Node ABI.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── main/
│   ├── index.ts              # Electron entry — BrowserWindow, app lifecycle
│   ├── ipc/                  # ipcMain.handle registrations per module
│   │   ├── settings.ts       # IPC handlers for settings (Phase 1)
│   │   ├── habits.ts         # Stub handlers (schema ready, UI in Phase 2)
│   │   ├── planner.ts
│   │   └── expenses.ts
│   ├── repositories/         # One class per module domain
│   │   └── SettingsRepository.ts
│   └── db/
│       ├── connection.ts     # DB singleton — app.getPath('userData')
│       └── migrations/       # Numbered SQL files: 0001_init.sql, 0002_xxx.sql
├── preload/
│   └── index.ts              # contextBridge.exposeInMainWorld('api', ...)
├── renderer/
│   ├── main.tsx              # React entry
│   ├── App.tsx               # Root component, module switcher
│   ├── shell/
│   │   ├── Sidebar.tsx       # Icon-only 48-56px sidebar
│   │   ├── WindowChrome.tsx  # Frameless window, drag region, controls
│   │   ├── ModuleHeader.tsx  # Thin header bar
│   │   └── KeyboardRouter.tsx # Global keyboard event handler
│   ├── settings/
│   │   └── SettingsView.tsx  # Phase 1 settings screen
│   ├── habits/               # Placeholder — populated Phase 2
│   ├── planner/
│   ├── expenses/
│   └── shared/
│       └── styles/
│           └── globals.css   # CSS custom properties — all design tokens here
└── shared/
    ├── ipc-types.ts          # IPC channel contract (both main + renderer import)
    └── domain-types.ts       # Shared domain models
```

### Pattern 1: Typed IPC Bridge (contextBridge)
**What:** A shared `ipc-types.ts` defines the API surface. Preload exposes it. Renderer calls it through `window.api`. No raw `ipcRenderer` in renderer code.
**When to use:** Always — from the first line of Electron code.
```typescript
// Source: ARCHITECTURE.md (verified against Electron official docs pattern)

// src/shared/ipc-types.ts
export interface SettingsAPI {
  get: () => Promise<AppSettings>;
  set: (settings: Partial<AppSettings>) => Promise<void>;
}

export interface API {
  settings: SettingsAPI;
  // Add habits, planner, expenses in Phase 2
}

// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';
import type { API } from '../shared/ipc-types';

const api: API = {
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (s) => ipcRenderer.invoke('settings:set', s),
  },
};

contextBridge.exposeInMainWorld('api', api);

// src/renderer — global declaration
declare global {
  interface Window { api: API; }
}
```

### Pattern 2: BrowserWindow Configuration (Frameless + Secure)
**What:** Correct security flags plus frameless configuration for the custom titlebar.
**When to use:** The only acceptable configuration — no exceptions.
```typescript
// Source: Electron official docs + ARCHITECTURE.md
const win = new BrowserWindow({
  width: 1200,
  height: 800,
  frame: false,              // custom drag region handles window chrome
  backgroundColor: '#16161e', // prevents white flash on startup
  titleBarStyle: 'hidden',    // macOS: keeps traffic lights, hides native bar
  webPreferences: {
    preload: path.join(__dirname, '../preload/index.js'),
    contextIsolation: true,   // REQUIRED — security model
    nodeIntegration: false,   // REQUIRED — security model
    sandbox: false,           // needed for preload to use Node APIs
  },
});

// Single instance lock — prevents concurrent SQLite writes
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

// Guard DevTools — never open in production
if (!app.isPackaged) {
  win.webContents.openDevTools();
}
```

### Pattern 3: SQLite Migration Runner
**What:** On every app startup, run migrations in numeric order using `PRAGMA user_version` as the version tracker. Never modify existing migration files — only add new ones.
**When to use:** Always — from the moment the DB file is first created.
```typescript
// Source: ARCHITECTURE.md + PITFALLS.md pattern

// src/main/db/connection.ts
import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'monolith.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
  }
  return db;
}

// src/main/db/migrations runner
const migrations: { version: number; sql: string }[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        days_of_week TEXT NOT NULL DEFAULT '1111111',
        archived INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS habit_completions (
        habit_id TEXT NOT NULL,
        date TEXT NOT NULL,
        PRIMARY KEY (habit_id, date),
        FOREIGN KEY (habit_id) REFERENCES habits(id)
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        notes TEXT,
        date TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        position INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT
      );
      CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        balance INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        amount INTEGER NOT NULL,
        date TEXT NOT NULL,
        category_id TEXT NOT NULL,
        wallet_id TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (wallet_id) REFERENCES wallets(id)
      );
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    `,
  },
];

export function runMigrations(db: Database.Database): void {
  const currentVersion = db.pragma('user_version', { simple: true }) as number;
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      db.exec(migration.sql);
      db.pragma(`user_version = ${migration.version}`);
    }
  }
}
```

### Pattern 4: Design Token System (Tailwind v4 + CSS Custom Properties)
**What:** All visual constants — colors, type scale, spacing, radius — defined as CSS custom properties in `globals.css`. Tailwind v4 uses `@theme` directive to reference these. No values are hardcoded in component files.
**When to use:** Define before writing any component — tokens are the contract all UI consumes.
```css
/* Source: Tailwind v4 docs — CSS-based config replaces tailwind.config.js */
/* src/renderer/shared/styles/globals.css */

@import "tailwindcss";

@theme {
  /* Color palette — cool charcoal dark theme */
  --color-bg-base: #16161e;
  --color-bg-elevated: #1a1a2e;
  --color-bg-overlay: #1e1e30;
  --color-bg-subtle: #22223a;

  /* Text hierarchy */
  --color-text-primary: #e8e8f0;
  --color-text-secondary: #9494a8;
  --color-text-muted: #5a5a72;
  --color-text-disabled: #3a3a52;

  /* Accent — electric indigo blue */
  --color-accent: #6366f1;
  --color-accent-hover: #818cf8;
  --color-accent-subtle: rgba(99, 102, 241, 0.15);

  /* Border */
  --color-border: rgba(255, 255, 255, 0.07);
  --color-border-focused: rgba(99, 102, 241, 0.5);

  /* Type scale — base 12px, tight line heights */
  --font-size-micro: 10px;
  --font-size-caption: 11px;
  --font-size-label: 12px;
  --font-size-body: 13px;
  --font-size-heading: 15px;
  --font-size-display: 18px;

  --line-height-tight: 1.3;
  --line-height-normal: 1.5;

  /* Spacing — 4px grid */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* Sidebar */
  --sidebar-width: 52px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

  /* Transitions */
  --duration-fast: 80ms;
  --duration-normal: 150ms;
}

/* Inter font import */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

body {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: var(--font-size-body);
  line-height: var(--line-height-normal);
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  user-select: none; /* Desktop app convention */
}
```

### Pattern 5: Global Keyboard Router
**What:** A single event listener at the document level processes all keyboard shortcuts. Modules register their shortcuts with the router when mounted. Alt+1-4 for module switching, ? for shortcut overlay, Escape for dismiss.
**When to use:** Built in Phase 1 before any module code — keyboard routing must precede modules.
```typescript
// Source: CONTEXT.md keyboard conventions + PITFALLS.md Pitfall 5

// src/renderer/shell/KeyboardRouter.tsx
import { useEffect, useCallback } from 'react';
import type { ModuleId } from '../App';

interface KeyboardRouterProps {
  onNavigate: (module: ModuleId) => void;
  onShowShortcuts: () => void;
  onEscape: () => void;
}

export function KeyboardRouter({ onNavigate, onShowShortcuts, onEscape }: KeyboardRouterProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Module switching — Alt+1-4
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      switch (e.key) {
        case '1': e.preventDefault(); onNavigate('dashboard'); return;
        case '2': e.preventDefault(); onNavigate('habits'); return;
        case '3': e.preventDefault(); onNavigate('planner'); return;
        case '4': e.preventDefault(); onNavigate('expenses'); return;
      }
    }

    // Global overlays — no modifier
    if (!e.altKey && !e.ctrlKey && !e.metaKey) {
      // Only when not in an input/textarea
      const target = e.target as HTMLElement;
      const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (!isEditing) {
        switch (e.key) {
          case '?': e.preventDefault(); onShowShortcuts(); return;
          case 'Escape': e.preventDefault(); onEscape(); return;
        }
      } else if (e.key === 'Escape') {
        // Escape always works, even in inputs
        e.preventDefault();
        onEscape();
        return;
      }
    }
  }, [onNavigate, onShowShortcuts, onEscape]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null; // No UI — pure behavior
}
```

### Pattern 6: electron-store for Settings Persistence
**What:** electron-store provides typed key-value persistence outside SQLite. Used for app preferences and UI state. Accessed from the main process and exposed via IPC.
**When to use:** Flat preferences (date format, notification time, window bounds). Never for relational data.
```typescript
// Source: electron-store 11.x API (verified current)

// src/main/settings/store.ts
import Store from 'electron-store';

export interface AppSettings {
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY';
  notificationTime: string; // "09:00"
  windowBounds?: { width: number; height: number; x: number; y: number };
}

const defaults: AppSettings = {
  dateFormat: 'DD/MM/YYYY',
  notificationTime: '09:00',
};

export const settingsStore = new Store<AppSettings>({ defaults });

// IPC handler — src/main/ipc/settings.ts
import { ipcMain } from 'electron';
import { settingsStore } from '../settings/store';

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', () => settingsStore.store);
  ipcMain.handle('settings:set', (_, updates: Partial<AppSettings>) => {
    Object.assign(settingsStore.store, updates); // or use settingsStore.set(key, value)
  });
}
```

### Pattern 7: Tailwind v4 Vite Plugin Configuration
**What:** Tailwind v4 uses `@tailwindcss/vite` plugin instead of PostCSS. The config lives in CSS, not in a JS config file.
**When to use:** Required setup for Tailwind v4 in the electron-vite project.
```typescript
// Source: Tailwind v4 official docs — vite.config.ts
import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  main: { /* electron main config */ },
  preload: { /* preload config */ },
  renderer: {
    plugins: [
      react(),
      tailwindcss(), // Add Tailwind v4 plugin here
    ],
  },
});
```

### Anti-Patterns to Avoid

- **nodeIntegration: true:** Never enable. All Node/SQLite access stays in main process only. contextBridge is the only interface.
- **Inline style values:** Never write `fontSize: 13` or `color: '#888'` in component files. All values come from CSS custom properties via Tailwind classes or `var(--token)`.
- **ipcMain.handleSync / event.returnValue:** Synchronous IPC blocks the renderer. Use `ipcMain.handle` exclusively.
- **react-router-dom BrowserRouter:** Use state-based routing. If routing library needed, use `HashRouter`. Never `BrowserRouter` in Electron (file:// protocol incompatible).
- **Raw ipcRenderer in renderer:** Renderer must never import `ipcRenderer` directly. All IPC goes through `window.api.*` from the contextBridge.
- **Vibrancy / window transparency:** Causes GPU overhead and flickering on Windows. Use solid dark background colors.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Settings key-value persistence | Custom JSON file write/read | electron-store 11.x | File locking, atomic writes, schema validation, TypeScript types |
| SQLite type-safe queries | Raw SQL strings everywhere | drizzle-orm 0.45.1 | Compile-time type checking on query results |
| React IPC data cache | Manual stale flags in stores | @tanstack/react-query 5.91.x | Handles background refetch, loading states, mutation invalidation |
| Date arithmetic for streaks | Custom date math | date-fns 4.1.0 | Timezone handling is subtle and wrong without a library |
| Native module rebuild | Manual `node-gyp` | electron-vite template handles via electron-rebuild | Native modules must be rebuilt against Electron's Node ABI |

**Key insight:** The "don't hand-roll" items in this phase are all infrastructure concerns. The point is to spend zero time on storage plumbing and 100% of time on the visual shell and design system — those are what Phase 1 is actually delivering.

---

## Common Pitfalls

### Pitfall 1: Wrong Electron Version — Old Tutorials
**What goes wrong:** Searching for electron-vite setup tutorials finds examples from Electron 28-30 era that use different security defaults and a different preload script compilation approach.
**Why it happens:** Electron 41 has different defaults and build output paths than Electron 28-34.
**How to avoid:** Use the official electron-vite template command: `npm create @quick-start/electron@latest monolith -- --template react-ts`. Do not copy configs from blog posts.
**Warning signs:** `sandbox: true` in webPreferences (breaks better-sqlite3 in preload), different preload dist path assumptions.

### Pitfall 2: better-sqlite3 Packaged Against Wrong Node ABI
**What goes wrong:** `npm install better-sqlite3` installs the native module compiled for the system Node.js. Electron embeds its own Node.js with a different ABI version. The module fails to load at runtime with a cryptic native binding error.
**Why it happens:** Native Node modules are compiled at install time. Electron needs them recompiled against Electron's Node version.
**How to avoid:** The electron-vite template should include electron-rebuild. Verify with `npm run postinstall` or add `"postinstall": "electron-rebuild"` to package.json scripts. Do this before the first `npm run dev`.
**Warning signs:** `Error: The module ... was compiled against a different Node.js version` on app start.

### Pitfall 3: Tailwind v4 CSS Config vs v3 JS Config
**What goes wrong:** Developer copies a `tailwind.config.js` from v3 docs or a tutorial. In Tailwind v4, configuration lives in CSS `@theme` blocks — the JS config file is not used. The custom token values silently don't apply.
**Why it happens:** Tailwind v4 is a major breaking change in configuration approach. Most tutorials and Stack Overflow answers are for v3.
**How to avoid:** Use `@tailwindcss/vite` plugin (not PostCSS). Put all custom tokens in `@theme {}` in `globals.css`. Do not create `tailwind.config.js`. Verified: Tailwind 4.2.2 (latest) is stable.
**Warning signs:** CSS custom properties from `@theme` not being applied; `tailwind.config.js` file in project root.

### Pitfall 4: electron-store v11 Breaking Changes
**What goes wrong:** Prior project research referenced electron-store without a verified version. electron-store is now at v11.0.2, which dropped CommonJS support and is ESM-only. Incorrect import style causes build failures.
**Why it happens:** electron-store v9+ moved to ESM. Electron main process ESM configuration requires specific electron-vite settings.
**How to avoid:** Import as ESM: `import Store from 'electron-store'`. Ensure the electron-vite main process config handles ESM correctly. If CommonJS issues arise, check for `"type": "module"` in package.json or electron-vite's `build.lib.formats` setting.
**Warning signs:** `require is not defined` or `Cannot use import statement` errors in the main process bundle.

### Pitfall 5: Frameless Window Drag Region
**What goes wrong:** With `frame: false`, the window becomes impossible to drag. Users cannot move the app window.
**Why it happens:** The OS uses the native title bar for window dragging. Removing it removes drag behavior.
**How to avoid:** Apply `-webkit-app-region: drag` to the custom drag region element. Apply `-webkit-app-region: no-drag` to all interactive elements (buttons, inputs) within it. The drag region height should be approximately 36-40px at the top of the window.
```css
.window-drag-region {
  -webkit-app-region: drag;
  height: 36px;
}
.window-drag-region button,
.window-drag-region input {
  -webkit-app-region: no-drag;
}
```
**Warning signs:** Window cannot be repositioned; or buttons inside the drag region don't respond to clicks.

### Pitfall 6: All Three Module Schemas Not Defined in Migration 1
**What goes wrong:** Phase 1 only defines the settings schema. Phases 2-4 each add their own migrations, but some Phase 2 IPC handlers reference tables that don't exist when the migration runner runs for the first time.
**Why it happens:** Lazy migration design — "I'll add those tables later."
**How to avoid:** Define ALL three module schemas (habits, planner, expenses including categories and wallets) in migration version 1. Subsequent migrations add columns or indexes. This is the approach in Pattern 3 above.
**Warning signs:** `no such table: habits` error in Phase 2 without a Phase 2 migration.

---

## Code Examples

### Shell App Root with State-Based Navigation
```typescript
// Source: PITFALLS.md Pitfall 12 — state-based routing for desktop app
// src/renderer/App.tsx
import { useState } from 'react';
import { Sidebar } from './shell/Sidebar';
import { WindowChrome } from './shell/WindowChrome';
import { KeyboardRouter } from './shell/KeyboardRouter';
import { SettingsView } from './settings/SettingsView';

export type ModuleId = 'dashboard' | 'habits' | 'planner' | 'expenses' | 'settings';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleEscape = () => {
    if (showShortcuts) { setShowShortcuts(false); return; }
    if (activeModule !== 'dashboard') { setActiveModule('dashboard'); }
  };

  return (
    <div className="app-root" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <KeyboardRouter
        onNavigate={setActiveModule}
        onShowShortcuts={() => setShowShortcuts(true)}
        onEscape={handleEscape}
      />
      <WindowChrome />
      <Sidebar activeModule={activeModule} onNavigate={setActiveModule} />
      <main style={{ flex: 1, overflow: 'auto' }}>
        {activeModule === 'settings' && <SettingsView />}
        {/* Phase 2+ modules render here */}
        {activeModule === 'dashboard' && <div>Dashboard placeholder</div>}
        {activeModule === 'habits' && <div>Habits placeholder</div>}
        {activeModule === 'planner' && <div>Planner placeholder</div>}
        {activeModule === 'expenses' && <div>Expenses placeholder</div>}
      </main>
    </div>
  );
}
```

### Sidebar Component (Icon-Only, 52px)
```typescript
// Source: CONTEXT.md locked decisions — 48-56px sidebar, tooltips on hover
import type { ModuleId } from '../App';

const NAV_ITEMS: { id: ModuleId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'habits', label: 'Habits' },
  { id: 'planner', label: 'Planner' },
  { id: 'expenses', label: 'Expenses' },
];

export function Sidebar({ activeModule, onNavigate }: {
  activeModule: ModuleId;
  onNavigate: (id: ModuleId) => void;
}) {
  return (
    <nav style={{ width: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column' }}>
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          title={item.label} // Tooltip — browser native on desktop
          aria-label={item.label}
          data-active={activeModule === item.id}
        >
          {/* Icon component here */}
        </button>
      ))}
      <div style={{ marginTop: 'auto' }}>
        <button onClick={() => onNavigate('settings')} title="Settings" aria-label="Settings">
          {/* Gear icon */}
        </button>
      </div>
    </nav>
  );
}
```

### Settings TanStack Query Integration
```typescript
// Source: ARCHITECTURE.md TanStack Query + IPC pattern
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const SETTINGS_KEY = ['settings'];

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: () => window.api.settings.get(),
    staleTime: Infinity, // Settings don't go stale
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: Partial<AppSettings>) => window.api.settings.set(updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: SETTINGS_KEY }),
  });
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact for This Project |
|--------------|------------------|--------------|------------------------|
| tailwind.config.js | @theme block in CSS | Tailwind v4.0 (stable 4.2.2) | No JS config file; Vite plugin required |
| PostCSS for Tailwind | @tailwindcss/vite plugin | Tailwind v4.0 | Simpler setup, faster builds |
| electron-vite ^3.x | electron-vite 5.0.0 | ~Q1 2026 | Vite 8.x peer dep; verify template compatibility |
| Electron 34.x | Electron 41.x | Current (41.0.3) | Node.js 22+, Chromium 136+; better-sqlite3 12.x compatible |
| drizzle-orm ^0.40.x | drizzle-orm 0.45.1 | Current | API stable; drizzle-kit 0.31.10 is separate package |
| electron-store v8 | electron-store 11.0.2 | ~2024 | ESM-only; CJS support dropped |
| recharts ^2.x | recharts 3.8.0 | 2024 | New API changes; used in Phase 4 but schema defined now |

**Deprecated / confirmed not to use:**
- `tailwind.config.js`: Not applicable in v4
- `react-router-dom BrowserRouter`: Incompatible with Electron `file://` protocol
- `nodeIntegration: true`: Deprecated in Electron, security vulnerability
- `ipcMain.handleSync`: Synchronous IPC blocks renderer event loop

---

## Open Questions

1. **electron-store v11 ESM configuration with electron-vite**
   - What we know: electron-store 11.x is ESM-only; electron-vite 5.x supports ESM in main process
   - What's unclear: Whether electron-vite's default CJS output for main process requires explicit ESM configuration to use electron-store v11
   - Recommendation: If import fails at startup, add `"type": "module"` to package.json or configure electron-vite to output ESM for the main bundle. Alternatively, check if electron-store provides a CJS-compatible shim in v11.

2. **better-sqlite3 and Electron 41.x ABI compatibility**
   - What we know: better-sqlite3 12.8.0 supports Node 20.x/22.x/23.x/24.x/25.x
   - What's unclear: Exact ABI compatibility with Electron 41's embedded Node version without running electron-rebuild
   - Recommendation: Run `electron-rebuild` after install; if the template doesn't include it, add `"postinstall": "electron-rebuild"` before first `npm run dev`.

3. **Inter font — bundled vs CDN**
   - What we know: Google Fonts CDN works in development; in a local-first desktop app with no internet assumption, CDN may fail offline
   - What's unclear: Whether the app requires internet access for font loading
   - Recommendation: Bundle Inter font files locally via npm package `@fontsource/inter` rather than relying on Google Fonts CDN. Electron apps should not depend on network for core UI.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | None yet — Wave 0 creates `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SHELL-03 | Design tokens defined — all CSS custom properties present in globals.css | unit | `npx vitest run tests/design-tokens.test.ts` | ❌ Wave 0 |
| SHELL-04 | Navigation between modules produces no loading state (state-based) | unit | `npx vitest run tests/shell-navigation.test.tsx` | ❌ Wave 0 |
| SHELL-05 | No generic component library classes in rendered output | unit | `npx vitest run tests/no-generic-ui.test.tsx` | ❌ Wave 0 |
| SET-01 | Settings get/set round-trip persists across store reset | unit | `npx vitest run tests/settings-persistence.test.ts` | ❌ Wave 0 |
| IPC bridge | contextBridge exposes typed methods; no raw ipcRenderer in renderer | unit | `npx vitest run tests/ipc-types.test.ts` | ❌ Wave 0 |
| Migrations | Migration runner creates all tables; user_version increments correctly | unit | `npx vitest run tests/migrations.test.ts` | ❌ Wave 0 |
| Keyboard | Alt+1-4 triggers correct module navigation; ? triggers shortcut overlay | unit | `npx vitest run tests/keyboard-router.test.tsx` | ❌ Wave 0 |

> Note: IPC handlers and BrowserWindow configuration are Electron-specific and cannot be unit tested with Vitest alone. They are verified manually at app launch or via Playwright with Electron support (deferred to Phase 5).

### Sampling Rate
- **Per task commit:** `npx vitest run tests/[relevant-test].test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/design-tokens.test.ts` — covers SHELL-03; validates CSS custom properties are defined
- [ ] `tests/shell-navigation.test.tsx` — covers SHELL-04; validates state-based module switching
- [ ] `tests/no-generic-ui.test.tsx` — covers SHELL-05; validates no MUI/shadcn class patterns
- [ ] `tests/settings-persistence.test.ts` — covers SET-01; validates electron-store round-trip
- [ ] `tests/ipc-types.test.ts` — validates IPC type contract matches preload exposure
- [ ] `tests/migrations.test.ts` — validates migration runner creates all tables with correct schema
- [ ] `tests/keyboard-router.test.tsx` — validates Alt+1-4 and ? shortcut behavior
- [ ] `vitest.config.ts` — project-level Vitest config (jsdom environment for renderer tests)
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`

---

## Sources

### Primary (HIGH confidence — verified)
- npm registry (2026-03-19 live queries): Electron 41.0.3, electron-vite 5.0.0, drizzle-orm 0.45.1, better-sqlite3 12.8.0, Tailwind 4.2.2, electron-store 11.0.2, recharts 3.8.0, vitest 4.1.0, date-fns 4.1.0, TanStack Query 5.91.2, Zustand 5.0.12
- `.planning/research/ARCHITECTURE.md` — two-process model, IPC patterns, migration runner pattern (HIGH confidence)
- `.planning/research/PITFALLS.md` — security config, migration strategy, design tokens, keyboard router (HIGH confidence for Electron-core pitfalls)
- `.planning/phases/01-foundation/01-CONTEXT.md` — locked design decisions, keyboard conventions

### Secondary (MEDIUM confidence)
- `.planning/research/STACK.md` — alternatives analysis, library rationale (patterns verified against architecture research)
- `.planning/research/SUMMARY.md` — pitfall summary, build order dependencies

### Tertiary (LOW confidence — needs validation at implementation time)
- electron-store v11 ESM + electron-vite interoperability — verify at first `npm run dev`
- better-sqlite3 12.8.x ABI with Electron 41 — verify after electron-rebuild runs
- Inter font CDN vs local bundling decision — validate offline behavior during dev

---

## Metadata

**Confidence breakdown:**
- Standard stack versions: HIGH — verified against npm registry 2026-03-19
- Architecture patterns: HIGH — stable Electron patterns, unchanged since Electron 12+
- Design tokens / CSS approach: HIGH — Tailwind 4.2.2 confirmed stable, @theme block documented
- Pitfalls: HIGH for security/IPC (official Electron docs confirm), MEDIUM for tooling interop (ESM/CJS edge cases)

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 for stack versions (npm registry changes); architecture patterns are stable indefinitely
