# Architecture Patterns

**Project:** Monolith (Habit Tracker + Daily Planner + Expense Tracker)
**Domain:** Electron + React desktop app with local SQLite storage
**Researched:** 2026-03-19
**Confidence:** HIGH (Electron's two-process model is stable and well-documented; patterns verified against established Electron boilerplates and community consensus through training cutoff August 2025)

---

## Recommended Architecture

Monolith follows the standard **Electron two-process split** with a React renderer, a thin IPC bridge (context bridge), and a synchronous SQLite layer in the main process. The three product modules (habits, planner, expenses) share a single shell/layout but are isolated at the feature-folder level.

```
┌──────────────────────────────────────────────────────────┐
│  Renderer Process  (Chromium — React runs here)          │
│                                                          │
│  ┌────────────┐  ┌──────────────────────────────────┐   │
│  │  Shell     │  │  Module Views                    │   │
│  │  - Window  │  │  - /dashboard    (entry point)   │   │
│  │  - Sidebar │  │  - /habits                       │   │
│  │  - Router  │  │  - /planner                      │   │
│  │  - Theme   │  │  - /expenses                     │   │
│  └────────────┘  └──────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  State Layer (Zustand stores per module)         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  IPC Client (window.api — contextBridge calls)  │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────┬───────────────────────┘
                                   │ IPC (contextBridge / ipcRenderer → ipcMain)
┌──────────────────────────────────▼───────────────────────┐
│  Main Process  (Node.js)                                 │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  IPC Handlers (ipcMain.handle per channel)       │   │
│  │  - habits.*                                      │   │
│  │  - planner.*                                     │   │
│  │  - expenses.*                                    │   │
│  │  - dashboard.*                                   │   │
│  │  - notifications.*                               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Repository Layer (per module)                   │   │
│  │  - HabitRepository                               │   │
│  │  - PlannerRepository                             │   │
│  │  - ExpenseRepository                             │   │
│  │  - WalletRepository                              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  SQLite (better-sqlite3 — synchronous)           │   │
│  │  - Single DB file at userData path               │   │
│  │  - Migrations via drizzle-orm or raw SQL         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  OS Services                                     │   │
│  │  - Notification scheduler (node-cron / setInterval) │
│  │  - app.getPath('userData') for DB location       │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

| Component | Responsibility | Communicates With | Lives In |
|-----------|---------------|-------------------|----------|
| **Shell** | Window chrome, sidebar, keyboard router, theme | All module views (renders them) | Renderer |
| **Dashboard View** | Aggregates today's data across all modules | All three module stores (read-only) | Renderer |
| **Habit Module (Renderer)** | Habit UI, check-off interactions, streak display | HabitStore, IPC client | Renderer |
| **Planner Module (Renderer)** | Task list UI, checkoff, notes textarea | PlannerStore, IPC client | Renderer |
| **Expense Module (Renderer)** | Expense form, wallet balance display, charts | ExpenseStore, WalletStore, IPC client | Renderer |
| **IPC Client (preload.ts)** | Exposes `window.api.*` methods; wraps ipcRenderer | Renderer modules, Main IPC handlers | Preload bridge |
| **IPC Handlers (main)** | Receives invoke calls, delegates to repositories | IPC client, Repositories | Main process |
| **HabitRepository** | CRUD for habits and daily completions | SQLite | Main process |
| **PlannerRepository** | CRUD for tasks and daily notes | SQLite | Main process |
| **ExpenseRepository** | CRUD for expenses and categories | SQLite | Main process |
| **WalletRepository** | CRUD for wallets; balance deduction logic | SQLite, ExpenseRepository | Main process |
| **SQLite (DB)** | Persistent local storage | All repositories | Main process |
| **Notification Scheduler** | Daily check at configured time; fires OS notifications | ipcMain, Electron Notification API | Main process |

### The IPC Contract Rule
**No direct Node.js or SQLite access from the renderer.** The renderer only calls `window.api.*`. The preload script (`contextBridge.exposeInMainWorld`) defines the surface. This is not optional — Electron's security model requires `contextIsolation: true` and `nodeIntegration: false`.

---

## Data Flow

### Read Path (example: loading today's dashboard)

```
Dashboard mounts
  → useEffect fires
  → Zustand store action: loadDashboard()
  → window.api.dashboard.getToday()
  → ipcRenderer.invoke('dashboard:getToday')
  → [IPC boundary]
  → ipcMain.handle('dashboard:getToday')
  → HabitRepo.getTodayCompletions() + PlannerRepo.getTodayTasks() + ExpenseRepo.getTodayTotal()
  → SQLite synchronous queries (better-sqlite3)
  → result returned up the chain
  → Zustand store hydrated
  → React re-renders with data
```

### Write Path (example: checking off a habit)

```
User clicks habit checkbox
  → UI optimistic update (mark done immediately in store)
  → window.api.habits.complete({ habitId, date })
  → ipcRenderer.invoke('habits:complete', { habitId, date })
  → [IPC boundary]
  → ipcMain.handle('habits:complete')
  → HabitRepo.markComplete({ habitId, date })
  → SQLite INSERT into habit_completions
  → returns { success: true, newStreak: N }
  → Zustand store confirms / updates streak
```

Optimistic updates are essential for the sub-100ms feel requirement. Roll back on error.

### Notification Flow

```
App starts
  → Main process schedules daily check (e.g., 09:00 via setTimeout/cron)
  → At trigger time: HabitRepo.getUncheckedHabitsForToday()
  → If unchecked habits exist: new Notification({ title, body }) via Electron API
  → User clicks notification → BrowserWindow.focus() + navigate to /habits
```

---

## Patterns to Follow

### Pattern 1: Typed IPC Channels
**What:** Define IPC channels as a shared TypeScript types file (e.g., `src/shared/ipc-types.ts`) referenced by both preload and renderer. Avoids string typos and documents the API surface.
**When:** From day one — retrofitting types is painful.
**Example:**
```typescript
// src/shared/ipc-types.ts
export interface HabitAPI {
  list: () => Promise<Habit[]>;
  create: (data: CreateHabitDto) => Promise<Habit>;
  complete: (payload: { habitId: string; date: string }) => Promise<{ streak: number }>;
  delete: (habitId: string) => Promise<void>;
}

export interface API {
  habits: HabitAPI;
  planner: PlannerAPI;
  expenses: ExpenseAPI;
  wallets: WalletAPI;
  dashboard: DashboardAPI;
}

// preload.ts
contextBridge.exposeInMainWorld('api', { habits: { ... } } satisfies API);

// renderer
declare global { interface Window { api: API; } }
```

### Pattern 2: Repository Per Module
**What:** Each product module gets its own repository class responsible for all SQL for that domain. No cross-repository SQL joins — aggregate at the IPC handler level if needed.
**When:** Keeps modules independent; makes testing possible without the full app.
**Example:**
```typescript
// src/main/repositories/HabitRepository.ts
export class HabitRepository {
  constructor(private db: Database) {}

  list(): Habit[] {
    return this.db.prepare('SELECT * FROM habits ORDER BY created_at').all() as Habit[];
  }

  markComplete(habitId: string, date: string): void {
    this.db.prepare(`
      INSERT OR IGNORE INTO habit_completions (habit_id, date) VALUES (?, ?)
    `).run(habitId, date);
  }
}
```

### Pattern 3: Zustand Store Per Module (Renderer)
**What:** One Zustand store per product module (`useHabitStore`, `usePlannerStore`, `useExpenseStore`) plus one for dashboard aggregates. Stores own the async IPC calls and are the single source of truth in the renderer.
**When:** Always — global Redux-style store is overkill for this app; Context API causes too many re-renders for a dense, fast UI.
**Example:**
```typescript
// src/renderer/stores/habitStore.ts
interface HabitStore {
  habits: Habit[];
  isLoaded: boolean;
  load: () => Promise<void>;
  complete: (habitId: string, date: string) => Promise<void>;
}

export const useHabitStore = create<HabitStore>((set) => ({
  habits: [],
  isLoaded: false,
  load: async () => {
    const habits = await window.api.habits.list();
    set({ habits, isLoaded: true });
  },
  complete: async (habitId, date) => {
    // Optimistic update
    set((s) => ({ habits: s.habits.map(h => h.id === habitId ? { ...h, completedToday: true } : h) }));
    await window.api.habits.complete({ habitId, date });
  },
}));
```

### Pattern 4: Migration-First Database Setup
**What:** Run all migrations on app startup before any IPC handlers are registered. Use a simple sequential migration runner (not a heavy ORM if overkill).
**When:** Always — prevents "table doesn't exist" errors on first run and on upgrades.
**Example:**
```typescript
// src/main/db/migrate.ts
const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS habits (id TEXT PRIMARY KEY, name TEXT, created_at TEXT)`,
  `CREATE TABLE IF NOT EXISTS habit_completions (habit_id TEXT, date TEXT, PRIMARY KEY (habit_id, date))`,
  // ...
];

export function runMigrations(db: Database): void {
  db.exec('CREATE TABLE IF NOT EXISTS _migrations (id INTEGER PRIMARY KEY, run_at TEXT)');
  const ran = db.prepare('SELECT id FROM _migrations').all().map((r: any) => r.id);
  MIGRATIONS.forEach((sql, idx) => {
    if (!ran.includes(idx)) {
      db.exec(sql);
      db.prepare('INSERT INTO _migrations (id, run_at) VALUES (?, ?)').run(idx, new Date().toISOString());
    }
  });
}
```

### Pattern 5: Feature-Folder Structure
**What:** Organize renderer code by module, not by type. Each module owns its components, hooks, and store.
**When:** More than 2 modules — type-based folders (`/components`, `/hooks`) collapse into chaos.
```
src/
  main/
    index.ts              # Electron app entry, creates BrowserWindow
    ipc/                  # IPC handler registrations (habits.ts, planner.ts, expenses.ts)
    repositories/         # One file per module
    db/                   # DB connection singleton, migrations
    notifications/        # Scheduler
  preload/
    index.ts              # contextBridge setup, imports from shared/ipc-types
  renderer/
    App.tsx               # React root, router
    shell/                # Sidebar, layout, keyboard handler
    dashboard/            # Dashboard view + store
    habits/               # All habits UI + store
    planner/              # All planner UI + store
    expenses/             # All expenses UI + store
    shared/               # Shared UI components (Button, Input, Chart)
  shared/
    ipc-types.ts          # IPC contract types (imported by both sides)
    domain-types.ts       # Shared domain models (Habit, Task, Expense, Wallet)
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: nodeIntegration: true
**What:** Enabling `nodeIntegration` in the renderer to access Node APIs directly (including SQLite).
**Why bad:** Security vulnerability (XSS in renderer = full system access). Electron has deprecated this pattern. Better-sqlite3 in renderer also causes build tooling pain (native module in Vite).
**Instead:** All Node/SQLite access stays in main process. Renderer calls `window.api.*` only.

### Anti-Pattern 2: One Giant Global Store
**What:** A single Zustand or Redux store with all three modules' state merged.
**Why bad:** Habits, planner, and expenses have no shared state at runtime. A global store creates artificial coupling, harder to isolate features, and makes dashboard aggregation awkward.
**Instead:** One store per module. Dashboard reads from all three via selectors.

### Anti-Pattern 3: Async SQLite in Main Process
**What:** Using `better-sqlite3` asynchronously (e.g., wrapping everything in Promises internally) or using the `sqlite3` package (async by default).
**Why bad:** better-sqlite3 is synchronous by design and faster because of it. Wrapping it in async overhead gains nothing. The "async SQLite blocks Node.js event loop" concern does not apply meaningfully for single-user local apps with small datasets.
**Instead:** Use better-sqlite3 synchronously. IPC calls from renderer are still async (ipcRenderer.invoke returns a Promise), so the renderer never blocks.

### Anti-Pattern 4: Querying the DB From the Renderer via Exposed DB Object
**What:** Passing the raw `db` object through contextBridge to query from the renderer.
**Why bad:** contextBridge can only transfer plain objects/functions, not class instances with prototypes. It also eliminates the separation that makes the architecture safe and testable.
**Instead:** Expose only typed methods via contextBridge, never the db instance itself.

### Anti-Pattern 5: Rebuilding Dashboard Data in the Renderer
**What:** Loading all habits, all tasks, all expenses into separate stores then computing "today's dashboard" with client-side JavaScript in the renderer.
**Why bad:** Loads unnecessary data; more data over IPC than needed; slower for large datasets; aggregation logic scattered.
**Instead:** Dedicated `dashboard:getToday` IPC handler that runs a single SQL query joining what's needed and returns only the summary shape.

---

## Scalability Considerations

For a local single-user app, SQLite scales remarkably well. These projections assume realistic personal use.

| Concern | At 1 year of use | At 5 years of use | At 10 years of use |
|---------|-----------------|------------------|-------------------|
| DB file size | < 10 MB | < 50 MB | < 200 MB |
| Habits query (daily completions) | < 1ms | < 5ms | < 20ms |
| Expense queries with date filter | < 1ms | < 5ms | < 10ms |
| Full dashboard load | < 5ms | < 10ms | < 20ms |
| Concerns | None | Add indexes if needed | Consider archiving old completions |

SQLite with better-sqlite3 handles millions of rows well for read-heavy single-user workloads. No premature optimization needed.

**Indexes to add from day one:**
- `habit_completions(habit_id, date)` — already the PK, covered
- `tasks(date)` — dashboard and planner queries filter by date
- `expenses(date)` — monthly reports filter by date range

---

## Build Order Implications

Based on component dependencies:

```
1. DB + Migrations (foundation — everything else needs this)
   ↓
2. IPC Type Contracts (shared/ipc-types.ts — defines the surface both sides build to)
   ↓
3. Repositories (main process — implement one per module)
   ↓
4. IPC Handlers (main process — wire repositories to channels)
   ↓
5. Preload / contextBridge (exposes window.api — renderer can't function without it)
   ↓
6. Shell + Router (renderer — window frame, sidebar, navigation)
   ↓
7. Module Views (renderer — habits, planner, expenses in parallel once shell exists)
   ↓
8. Dashboard (renderer — reads from all modules; build last when all stores exist)
   ↓
9. Notifications (main process — add after core data layer is stable)
```

**Phase recommendation:** Phases should follow this dependency order. Don't start module views before the IPC bridge exists, and don't build the dashboard before module stores are stable. Notifications are additive and can be deferred to their own phase.

---

## Electron-Specific Structural Notes

### Window Creation (main/index.ts)
```typescript
const win = new BrowserWindow({
  width: 1200, height: 800,
  frame: false,          // custom titlebar for dev-tool aesthetic
  backgroundColor: '#0d0d0d',
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,   // required
    nodeIntegration: false,   // required
    sandbox: false,           // needed for better-sqlite3 in preload if accessed there (but keep DB in main)
  }
});
```

### DB File Location
```typescript
// Always use app.getPath('userData') — persists across app updates
const dbPath = path.join(app.getPath('userData'), 'monolith.db');
const db = new Database(dbPath);
```
Never store the DB in the app install directory — it gets wiped on updates.

### Single Instance Lock
```typescript
// Prevent multiple app windows (important for SQLite which can corrupt on concurrent writes)
if (!app.requestSingleInstanceLock()) {
  app.quit();
}
```

---

## Sources

- Electron official documentation — Process Model, Context Isolation, IPC (training data, HIGH confidence; stable API since Electron 12)
- better-sqlite3 synchronous design rationale — GitHub WilliamBrownStrong/better-sqlite3 (MEDIUM confidence — API stable through training cutoff)
- Zustand documentation — store-per-feature pattern (HIGH confidence — well-established React state pattern)
- Electron + Vite boilerplate patterns (electron-vite, electron-builder community) — MEDIUM confidence, verified against multiple OSS projects in training data
- SQLite single-user performance characteristics — HIGH confidence, well-documented behavior
