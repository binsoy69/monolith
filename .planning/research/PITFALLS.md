# Domain Pitfalls

**Domain:** Electron + React desktop productivity app (habit tracker + daily planner + expense tracker)
**Project:** Monolith
**Researched:** 2026-03-19
**Confidence:** MEDIUM — based on training data; external search tools unavailable. These are well-established Electron/React patterns documented extensively in the ecosystem. Flag for verification where noted.

---

## Critical Pitfalls

Mistakes that cause rewrites, severe performance degradation, or structural blockers.

---

### Pitfall 1: Blocking the Main Process with SQLite Queries

**What goes wrong:** Developers run SQLite queries synchronously on the main process (or on the renderer side without going through IPC), which freezes the entire Electron window — UI hangs, keyboard shortcuts stop responding, and the app feels broken.

**Why it happens:** `better-sqlite3` is a synchronous API by design (unlike `node-sqlite3`). It's easy to call it directly in main process event handlers. When a query or write takes >16ms, the main process blocks and the renderer stalls waiting for IPC responses.

**Consequences:** Every data entry — logging a habit, checking off a task, recording an expense — causes a UI freeze. Defeats the "instant performance" requirement entirely. Cannot be fixed post-architecture without restructuring IPC.

**Prevention:**
- All SQLite operations belong in the main process but must be called from a worker thread using `worker_threads` (Node.js) or offloaded using Electron's `MessagePort` IPC to keep the main process event loop free.
- Alternatively: use `better-sqlite3` in the main process but batch writes and defer non-critical reads. Never call SQLite in a synchronous IPC handler (`ipcMain.handleSync`).
- Use `ipcMain.handle` (async) exclusively. Never use `ipcMain.on` + `event.returnValue` (synchronous IPC).
- Run `better-sqlite3` in a dedicated worker thread for write-heavy operations. The main process orchestrates; the worker owns the DB file.

**Detection (warning signs):**
- UI freezes or stutters during data saves
- Chrome DevTools shows long tasks in the main thread that correlate with IPC calls
- `ipcMain.handleSync` anywhere in codebase

**Phase:** Address in Phase 1 (architecture/IPC setup). Wrong to fix later.

---

### Pitfall 2: Skipping the Context Bridge (nodeIntegration: true)

**What goes wrong:** Developers enable `nodeIntegration: true` and `contextIsolation: false` in `BrowserWindow` options to make it easy to call Node.js APIs from React components. This works but creates a serious security hole — any XSS in the React layer has full Node.js access, including filesystem and shell execution.

**Why it happens:** It's the "easy" path. Tutorials from 2019-2021 commonly recommend it. Stack Overflow answers still show it.

**Consequences:** Security vulnerability. More importantly for Monolith: harder to refactor later. Electron has deprecated this pattern and future versions may remove it entirely. Also makes it impossible to add web-targeted features later.

**Prevention:**
- Always use `contextIsolation: true` and `nodeIntegration: false`.
- Expose only specific, named functions via `contextBridge.exposeInMainWorld` in the preload script.
- The preload script acts as the contract between renderer and main. Keep it minimal and explicit.
- Never expose raw IPC (`ipcRenderer`) to the renderer — wrap it in named methods.

```typescript
// preload.ts — correct pattern
contextBridge.exposeInMainWorld('db', {
  getHabits: () => ipcRenderer.invoke('db:habits:getAll'),
  createHabit: (data) => ipcRenderer.invoke('db:habits:create', data),
});
```

**Detection (warning signs):**
- `nodeIntegration: true` in any `BrowserWindow` configuration
- `require` calls in React component files
- Direct `ipcRenderer` import in renderer-side code

**Phase:** Phase 1 (Electron shell setup). Must be right from day one.

---

### Pitfall 3: React Re-Renders Destroying "Instant" Feel on Dense Dashboard

**What goes wrong:** The dashboard shows habits + tasks + expenses simultaneously. Without proper memoization and state isolation, any state change (checking a habit) causes the entire dashboard to re-render — including charts, expense summaries, and task lists. On a dense, data-heavy UI, this causes visible jank.

**Why it happens:** React's default behavior re-renders the component tree from the changed state node downward. Developers structure state at the app/page level for simplicity, which means a single checkbox check triggers hundreds of component re-renders.

**Consequences:** Dashboard feels sluggish. Keyboard interactions have visible lag. The "no loading spinners, snappy transitions" requirement fails. Gets worse as data grows.

**Prevention:**
- Use Zustand with fine-grained slice selectors. Each module (habits, tasks, expenses) should have isolated state slices.
- Memoize all list items with `React.memo`. Habit rows, task rows, and expense rows should never re-render unless their specific data changes.
- Use `useCallback` for all event handlers passed as props to list items.
- Avoid storing derived data in state — compute it with `useMemo` or use a selector library.
- For charts (expense summaries, habit completion), compute chart data in a `useMemo` that only re-runs when the underlying data changes.
- Keep dashboard widgets as isolated components that read only what they need from the store.

**Detection (warning signs):**
- React DevTools Profiler showing >10 components re-rendering on a single checkbox check
- Visible frame drops when checking off a habit or task
- State structured as a single large object at the top level

**Phase:** Phase 2 (dashboard + module implementation). Establish patterns early before all three modules are built.

---

### Pitfall 4: SQLite Schema Designed Without Migration Strategy

**What goes wrong:** The initial schema is created with `CREATE TABLE IF NOT EXISTS` statements scattered in initialization code. When the schema needs to change (adding a column, new table, relationship change), developers write one-off `ALTER TABLE` statements directly in code, creating a brittle, version-incompatible mess. Users who installed early versions get broken databases on update.

**Why it happens:** SQLite is so easy to use that schema management feels unnecessary at first. Migration tooling seems like "enterprise overhead" for a personal app.

**Consequences:** v1.1 update breaks v1.0 databases. Data loss risk on schema changes. Cannot add wallet balance tracking, recurring habit logic, or tags without risky schema changes. Requires rewrite of data layer.

**Prevention:**
- Use `better-sqlite3-migrations` or implement a simple version table from day one.
- Schema version stored in `PRAGMA user_version`.
- Each migration is a numbered SQL file applied in order, skipped if already applied.
- Never modify existing migration files — add new ones.

```typescript
// Simple migration runner — apply from day one
const currentVersion = db.pragma('user_version', { simple: true });
const migrations = loadMigrationsFromDir('./migrations');
for (const migration of migrations.filter(m => m.version > currentVersion)) {
  db.exec(migration.sql);
  db.pragma(`user_version = ${migration.version}`);
}
```

**Detection (warning signs):**
- No migrations directory
- `CREATE TABLE IF NOT EXISTS` as the only schema management
- Schema changes done with `ALTER TABLE` directly in app initialization code

**Phase:** Phase 1 (data layer setup). Cannot be bolted on later without risk.

---

### Pitfall 5: Keyboard Navigation Built as an Afterthought

**What goes wrong:** Keyboard shortcuts are added module-by-module as features are built, with no global keyboard routing strategy. Different modules capture the same keys in conflicting ways. Focus management is inconsistent — pressing Tab in a modal moves focus out of it, pressing Escape does nothing, pressing Enter submits the wrong form. The "keyboard-driven" promise is unfulfilled.

**Why it happens:** It's hard to think about keyboard UX while simultaneously building data models, IPC, and UI. Keyboard handling gets deferred to "polish phase" and then requires touching every component.

**Consequences:** App requires mouse for most interactions. Power-user experience is broken. Retrofitting global keyboard management requires restructuring event listener strategy across all modules.

**Prevention:**
- Design and implement a global keyboard router in Phase 1 before any module is built. A single `useKeyboard` hook or context that modules register intents with.
- Define keyboard intents as an enum from day one: `CREATE_HABIT`, `NAVIGATE_DASHBOARD`, `OPEN_EXPENSE_FORM`, etc.
- Implement focus trapping for modals using a utility like `focus-trap-react` from the start.
- Each module registers its keyboard shortcuts with the global router when mounted, unregisters on unmount.
- Test keyboard flows manually after every feature addition, not as a final polish pass.

**Detection (warning signs):**
- `document.addEventListener('keydown', ...)` calls scattered across multiple components
- No centralized keyboard intent map
- Modals that don't trap focus or don't close on Escape

**Phase:** Phase 1 (shell + keyboard foundation). Must precede module development.

---

## Moderate Pitfalls

Mistakes that cause significant rework or degrade experience but don't block core functionality.

---

### Pitfall 6: Electron Auto-Updater Broken on First Deploy

**What goes wrong:** Auto-update is implemented at the end of the project, using `electron-updater`. Code signing is skipped or done incorrectly. The updater fails silently on macOS (requires notarization) or Windows (requires code signing certificate). Users get stale versions forever.

**Why it happens:** Code signing requires certificates that cost money (Windows) or require Apple Developer membership (macOS). Developers delay it until "before release" and then discover it takes days to set up.

**Prevention:**
- Plan code signing setup as a Phase 1 infrastructure task, not a last-minute one.
- For Windows: use a self-signed certificate for development, purchase an EV certificate for distribution.
- For macOS: Apple Developer Program enrollment required for notarization.
- Test the full update flow in a staging build before shipping v1.
- Use `electron-builder` with `publish` configuration pointing to GitHub Releases — free update hosting.

**Detection (warning signs):**
- `electron-updater` imported but `autoUpdater.checkForUpdatesAndNotify()` never tested end-to-end
- No `publish` configuration in `electron-builder.yml`
- Application not code-signed

**Phase:** Phase 3 or 4 (packaging/distribution setup). Do not defer to last phase.

---

### Pitfall 7: window.state Not Persisted Across App Restarts

**What goes wrong:** App opens, user navigates to Expenses, sets a date filter, closes the app. On next open, app is back on Dashboard with no state. Active tab, selected date, scroll position, open panels — all reset. Feels amnesiac for a daily-use productivity tool.

**Why it happens:** React state is ephemeral. Developers assume SQLite covers persistence needs (it does for data) but forget that UI state — current module, filters, preferences — also needs persistence.

**Prevention:**
- Use `electron-store` (or direct `fs` writes) to persist UI state: last active module, window size/position, last selected date, sidebar collapse state.
- Restore window bounds on startup (position, size) — users set their preferred layout once.
- The app should open exactly where the user left off.
- Keep persisted UI state separate from app data (SQLite). UI state is fast key-value, not relational.

**Detection (warning signs):**
- App always opens on Dashboard regardless of last-used module
- Window always opens at default size/position
- No `electron-store` or equivalent in dependencies

**Phase:** Phase 2 (shell features). Can be added incrementally but design the persistence layer early.

---

### Pitfall 8: Dense UI Becomes Illegible Without Typography System

**What goes wrong:** Developer builds dense UI component by component, setting font sizes, weights, and colors ad hoc. Result: 15 slightly different gray shades, 8 different font sizes, inconsistent spacing. The UI looks busy rather than dense. Information hierarchy is lost. The "dev-tool aesthetic" becomes "spreadsheet from 2003."

**Why it happens:** Dense UIs require more discipline than spacious ones. Every pixel decision matters more. Without a design system, decisions compound into chaos.

**Prevention:**
- Define a type scale before writing any UI: 5-6 font sizes maximum, named semantically (`display`, `label`, `body`, `caption`, `micro`).
- Define a color palette of no more than 12 values: 3-4 grays for text hierarchy, 2-3 accent colors, background layers.
- Define a spacing scale based on a 4px base unit. All padding/margin/gap values must be multiples of 4.
- Build a `Text` component and a `Stack`/`Grid` layout primitive before any feature UI. All UI is composed from these.
- Use CSS variables for all design tokens — makes theme iteration fast.

**Detection (warning signs):**
- Inline style `fontSize: 13` or `color: '#888'` in component files
- No design token file or CSS custom properties
- More than 6 distinct font size values in the codebase

**Phase:** Phase 1 (UI foundation). Must precede all feature development.

---

### Pitfall 9: IPC Channel Naming Chaos

**What goes wrong:** As modules are added, IPC channel names are invented ad hoc: `'get-habits'`, `'getHabits'`, `'habits/get'`, `'fetchHabitsFromDB'`. Preload script becomes a maze. Adding new channels requires searching for naming conventions that don't exist. TypeScript types drift from actual IPC signatures.

**Why it happens:** IPC channels are stringly-typed. No compiler enforces consistency. Each module adds channels without a system.

**Prevention:**
- Define all IPC channel names as a typed enum or const object in a shared types file from day one.
- Use a consistent naming convention: `'module:resource:action'` (e.g., `'habits:habit:create'`, `'expenses:transaction:list'`).
- Generate TypeScript types for preload methods from the channel definitions — one source of truth.
- All channel names live in one file. Adding a new channel requires touching one place.

```typescript
// shared/ipc-channels.ts
export const IPC = {
  habits: {
    list: 'habits:habit:list',
    create: 'habits:habit:create',
    update: 'habits:habit:update',
    delete: 'habits:habit:delete',
    complete: 'habits:completion:create',
  },
  expenses: {
    list: 'expenses:transaction:list',
    create: 'expenses:transaction:create',
  },
} as const;
```

**Detection (warning signs):**
- IPC channel names as raw strings scattered across multiple files
- No shared types file for IPC
- Inconsistent naming conventions across modules

**Phase:** Phase 1 (IPC architecture). Cheap to fix early, expensive later.

---

### Pitfall 10: Streak and Habit Completion Logic Tied to Calendar Day Assumptions

**What goes wrong:** Habit streak logic is written assuming "today" means the current calendar day in the user's local timezone. Works fine during development. Breaks for users in non-UTC timezones, breaks when the app is used past midnight, breaks when testing with historical data, breaks when device timezone changes.

**Why it happens:** `new Date()` in JavaScript returns local time but SQLite stores UTC. Comparison logic mixes the two. Date arithmetic for streaks (did user complete habit yesterday?) is easy to get wrong.

**Consequences:** Streaks reset incorrectly. Completion records attributed to wrong days. Users lose streaks they earned. Trust in the app is destroyed — habits and streaks are the emotional core of the product.

**Prevention:**
- Store all timestamps in SQLite as UTC ISO-8601 strings. Never store local time.
- Define a single canonical "what is today's date for habit purposes" function. All habit logic calls this function, never `new Date()` directly.
- Use the `date-fns` library for all date arithmetic — explicit timezone handling, no moment.js.
- Write unit tests for streak calculation covering: timezone edge cases, consecutive day completion, missed days, completion at 11:59pm vs 12:01am.
- Consider: what "day" means for a user active past midnight. Define a "habit day" cutoff time (e.g., 3am) and document it.

**Detection (warning signs):**
- `new Date()` used directly in streak/completion business logic
- No unit tests for streak calculation
- Dates stored as Unix timestamps without timezone documentation

**Phase:** Phase 2 (habit module). Test-driven development for streak logic before any UI.

---

## Minor Pitfalls

Mistakes that cause annoyance, minor rework, or technical debt but don't break core flows.

---

### Pitfall 11: Electron DevTools Open in Production Build

**What goes wrong:** `webContents.openDevTools()` left in production build. Users see Chrome DevTools panel on first launch, or can open it accidentally. Exposes internal IPC structure.

**Prevention:** Guard `openDevTools()` with `!app.isPackaged` check. Use `electron-is-dev` or `app.isPackaged` consistently.

**Phase:** Phase 1. One-line guard.

---

### Pitfall 12: react-router-dom Used for Navigation

**What goes wrong:** Developer installs `react-router-dom` for module navigation (Dashboard → Habits → Expenses). In Electron with a file:// protocol, hash routing is required. `BrowserRouter` breaks; `HashRouter` works but URLs look ugly and routing logic is over-engineered for a sidebar nav with 5 views.

**Prevention:** For a 5-view desktop app with sidebar navigation, use simple state-based routing (`useState('dashboard' | 'habits' | 'planner' | 'expenses')`). No router library needed. If routing complexity grows, use `react-router-dom` with `HashRouter` — never `BrowserRouter`.

**Phase:** Phase 1 (shell navigation).

---

### Pitfall 13: No Error Boundaries Around Modules

**What goes wrong:** An error in the Expense chart component crashes the entire React tree. User loses access to Habits and Planner because one module threw. For a local app with no backend to diagnose errors, unhandled crashes are silent.

**Prevention:** Wrap each module (Habits, Planner, Expenses, Dashboard widgets) in a React `ErrorBoundary`. Display a module-specific fallback instead of a blank screen. Log errors to a local log file via IPC for debugging.

**Phase:** Phase 2 (per-module implementation).

---

### Pitfall 14: Expense Category Management Implemented as Hardcoded Enum

**What goes wrong:** Expense categories (Food, Transport, Entertainment) are hardcoded. Users want custom categories. Changing them later requires a schema migration and a UI rebuild.

**Prevention:** Categories stored in a `categories` table from day one, even if seeded with defaults. The UI for managing categories can come later, but the data model must support user-defined categories from the start.

**Phase:** Phase 1 (schema design).

---

### Pitfall 15: Window Transparency + Vibrancy Causing Rendering Issues

**What goes wrong:** Developer adds `vibrancy` or `backgroundMaterial` to achieve a frosted-glass effect (common in Electron "dev tool aesthetic" apps). On Windows 11, `mica` or `acrylic` effects cause significant GPU overhead, flickering on window resize, and white flash on startup.

**Prevention:** Use solid dark background colors instead of transparency effects. The Raycast/Warp aesthetic comes from typography and color discipline, not window transparency. If vibrancy is desired, test extensively on Windows 10, Windows 11, and macOS Ventura+ before committing.

**Phase:** Phase 1 (window configuration).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Electron shell setup | `nodeIntegration: true` shortcuts | Enforce contextBridge from first BrowserWindow |
| IPC architecture | Ad-hoc channel names, sync IPC | Define channel enum + use `ipcMain.handle` only |
| Schema design | No migration strategy | Add `user_version` pragma and migration runner immediately |
| UI foundation | Ad-hoc font sizes and colors | Design token file before first component |
| Keyboard system | Per-component event listeners | Global keyboard router before module development |
| Dashboard | Monolithic re-renders | Zustand slices + React.memo on list items |
| Habit module | Timezone-naive streak logic | Canonical date function + unit tests |
| Expense module | Hardcoded categories | Categories in DB table, not code |
| Packaging | Code signing as afterthought | Plan signing certificates in parallel with development |
| All modules | Missing error boundaries | Wrap each module, log to local file |

---

## Sources

**Confidence note:** All findings are MEDIUM confidence based on training data (knowledge cutoff August 2025). External web search, WebFetch, and Brave Search were unavailable during this research session. These pitfalls represent well-documented, consistently reported issues in the Electron + React ecosystem that appear in:

- Official Electron documentation (performance and security guides)
- `electron-builder` and `better-sqlite3` project issues and documentation
- React DevTools team recommendations on re-render optimization
- Community post-mortems on Electron app development

**Recommended verification:**
- Electron official docs: https://www.electronjs.org/docs/latest/tutorial/performance
- Electron security checklist: https://www.electronjs.org/docs/latest/tutorial/security
- `better-sqlite3` threading guide: https://github.com/WiseLibs/better-sqlite3/blob/master/docs/threads.md
- `electron-builder` auto-update docs: https://www.electron.build/auto-update.html
