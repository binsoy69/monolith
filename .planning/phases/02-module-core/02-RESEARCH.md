# Phase 2: Module Core - Research

**Researched:** 2026-03-20
**Domain:** Electron + React — SQLite repositories, IPC handlers, Zustand stores, React UI (habits/planner/expenses)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Habit check-off view**
- Card-based layout — each habit gets its own card
- Card shows: habit name, custom rounded checkbox, current streak count, best streak count (e.g., "Current: 7 days | Best: 14 days")
- Hide streak display entirely when streak is zero (both current and best)
- Check-off feedback: checkbox fills with accent color + brief subtle card highlight animation
- Checked-off cards reduce to dimmed/lower opacity
- Clicking anywhere on the habit card toggles check-off (entire card is the click target)
- Uncheck action: brief reverse animation (opacity restores, card briefly pulses)
- Show ALL active habits every day — unscheduled habits are dimmed and non-interactive (cannot check off)
- Ordering: unchecked habits first, checked habits sink to bottom
- Progress summary at top of habit list: "3/5 completed"
- Streaks calculated by consecutive SCHEDULED days only (missing an unscheduled day doesn't break the streak)

**Habit create/edit/archive**
- "+" button in the ModuleHeader bar opens an inline expandable form at the top of the card list
- Same inline form used for both create and edit (pre-filled with current values on edit)
- Schedule picker: checkbox row with day labels (Mon, Tue, Wed, etc.)
- Edit and archive actions accessed via right-click context menu on the habit card
- Archiving requires a brief inline confirmation prompt
- Archived habits hidden completely from today view
- Toggle in ModuleHeader to switch between active and archived habits views
- Empty state: centered "No habits yet" message with a prominent "Create your first habit" button

**Planner day view**
- Tabs in ModuleHeader: Tasks | Notes — date navigation on the left, tabs on the right, all in one bar
- Date navigation: left/right arrow buttons flanking the current date label
- "Today" label gets a subtle accent highlight when viewing the current day; other days show plain date
- Task count in date header: "2/5 done" format
- Quick-add text input persistently visible at the top of the task list — type title, press Enter to add
- Quick-add has a small inline date picker icon — defaults to the currently viewed day, changeable before adding
- Task rows: compact — checkbox on left, title text. No inline notes preview
- Task editing: right-click context menu → "Edit" expands an inline form below the row with title + notes fields
- Task reordering: drag and drop with drag handles
- Completed tasks: strikethrough text + dimmed opacity, sink to bottom of list (always visible, not collapsible)
- Task deletion: via context menu, with brief inline confirmation
- Move task to different date: context menu → "Move to date" with date picker
- Context menu items: Edit, Move to date, Delete (no Duplicate)
- Empty day: centered "No tasks for today" message with the quick-add input still visible at top

**Planner daily notes**
- Plain textarea (no markdown, no rich text)
- Auto-save with debounce (~500ms) — matches settings auto-save pattern from Phase 1
- Accessed via the "Notes" tab in the ModuleHeader

**Planner keyboard navigation**
- Left/right arrow keys navigate between days (when task list is focused, no input active)
- "T" key (when not in an input) jumps back to today's date

**Expense module structure**
- Layout: wallets sidebar panel on the left, expense list on the right — both always visible
- Total balance across all wallets shown at top of wallet sidebar
- Wallet cards with action buttons (edit, adjust balance)
- Balance adjustment: two options — "Set balance" (enter new total) and "Add/Subtract" (enter +/- amount)
- Wallet deletion blocked if wallet has linked expenses
- "+" button in ModuleHeader opens a modal/overlay form for logging an expense

**Expense logging form**
- Modal form fields: amount (with ₱ prefix), date (defaults to today), category dropdown, wallet dropdown, optional notes
- Currency: hardcoded Philippine Peso (₱) — no currency setting
- Category picker: dropdown with "+ New category" option at bottom for inline creation
- Wallet is REQUIRED for every expense (no unassigned expenses)
- Form does NOT remember last used category/wallet — always starts fresh
- Amount display: hide decimals when .00 (show ₱150 not ₱150.00, but show ₱150.50)

**Expense list and filtering**
- Flat chronological list, most recent first — each row shows date, amount, category (with color dot), wallet, notes indicator
- Persistent filter bar above the list: date range picker + category dropdown, clear filter button
- Edit/delete via right-click context menu — edit reopens the modal pre-filled, editing reverses original wallet deduction and applies new one
- Delete with brief confirmation, reverses wallet deduction

**Expense categories**
- Categories have colors — preset palette of 8-12 colors for selection on creation
- Pre-populated default categories (Food, Transport, Bills, Entertainment, etc.) on first run
- Category management section within the expense module (gear/manage link) — rename, recolor, delete
- Category deletion blocked if in use by expenses

**Expense empty state**
- If no wallets exist: prompt "Create your first wallet" before allowing expense logging (since wallet is required)
- If wallets exist but no expenses: standard "Log your first expense" prompt

**Data entry patterns (shared)**
- All modules use right-click context menus for edit/delete actions — consistent pattern
- All destructive actions use the same inline confirmation prompt style
- Optimistic updates with brief subtle indicator (shimmer/opacity) while IPC call is in flight
- IPC errors communicated via toast notifications
- "N" key (when not in an input) triggers add action for the current module
- Shared toast notification system mounted at app level, toasts appear bottom-right, auto-dismiss
- Separate Zustand store per module (habits-store.ts, planner-store.ts, expenses-store.ts)

### Claude's Discretion
- Exact card dimensions, spacing, and shadow values for habit cards
- Specific drag-and-drop library choice for task reordering
- Toast auto-dismiss duration
- Exact shimmer/opacity animation timing for optimistic updates
- Specific default category names and their preset colors
- Filter bar date range picker implementation details
- Context menu styling and positioning
- Wallet sidebar width
- Modal form sizing and positioning

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HAB-01 | User can create, edit, and archive habits | Repository pattern + inline form + context menu + IPC handler pattern |
| HAB-02 | User can check off habits daily with a single click/keystroke | Optimistic update pattern in Zustand store + IPC complete handler |
| HAB-03 | User can see current streak and best streak per habit | Streak calculation algorithm using date-fns + scheduled-days-only logic |
| HAB-05 | User can schedule habits for specific days of the week | `days_of_week` bitmask column already in schema — need read/write helpers |
| PLAN-01 | User can create tasks with a title and optional notes | TaskRepository.create + IPC handler + quick-add input pattern |
| PLAN-02 | User can check off and delete tasks | Optimistic toggle + context menu delete with IPC |
| PLAN-03 | User can assign tasks to specific dates | `date` field on Task type — quick-add inline date picker |
| PLAN-04 | User can navigate between days (past and future) | Client-side state (`viewDate` in PlannerStore) + arrow key handlers |
| PLAN-05 | User can reorder tasks within a day | @dnd-kit/sortable + position column in tasks table + IPC reorder handler |
| PLAN-09 | User can write freeform daily notes per day | DailyNotes repository (date PK) + debounced auto-save pattern |
| EXP-01 | User can log an expense with amount, date, and category | Modal form + ExpenseRepository.create + wallet deduction in transaction |
| EXP-02 | User can create custom expense categories | Category repository + inline creation in dropdown |
| EXP-03 | User can view expense history with filtering by date/category | ExpenseRepository.list with WHERE clauses + filter bar state in store |
| EXP-06 | User can create wallets with balances | WalletRepository.create + wallet sidebar UI |
| EXP-07 | Logging an expense auto-deducts from the selected wallet | SQLite transaction: INSERT expense + UPDATE wallet balance atomically |
| EXP-08 | User can manually adjust wallet balances | WalletRepository.adjustBalance (set/delta modes) + IPC handler |
| EXP-09 | User can add optional notes to expenses | `notes` column already in schema — expose in form and list row |
</phase_requirements>

---

## Summary

Phase 2 builds the complete data entry loop for all three modules on top of the already-solid Phase 1 foundation. The database schema is fully defined in migration v1 — no schema changes are needed. The IPC contract stubs in `ipc-types.ts` need to be uncommented and fleshed out. Three Zustand stores, three repository classes, and three sets of IPC handlers must be created following the exact patterns established by `settings.ts` and `useSettings.ts`.

The most technically sensitive areas are: (1) streak calculation correctness using `date-fns` with scheduled-days-only logic, (2) wallet balance atomicity when logging/editing/deleting expenses using SQLite transactions, (3) the optimistic update pattern wired with rollback on IPC error for all write operations, and (4) drag-and-drop task reordering using `@dnd-kit/sortable`. All other work is disciplined application of already-validated patterns.

The shared toast system and right-click context menu are cross-cutting concerns that should be built once (as shared renderer components) and used by all three modules. The `ModuleHeader` component needs to be upgraded to accept module-specific content (tabs for planner, "+" button, archive toggle) via props or a slot pattern.

**Primary recommendation:** Build main-process infrastructure (repositories + IPC handlers) first for each module, then renderer (store + UI), following the 02-01 through 02-06 plan split. Test streak calculation logic with unit tests before writing any UI.

---

## Standard Stack

### Core (already installed — verified from package.json)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| better-sqlite3 | ^12.8.0 | Synchronous SQLite in main process | Already installed; all tables defined in migration v1 |
| Zustand | ^5.0.12 | Per-module client state stores | Already installed; established pattern from Phase 1 |
| TanStack Query | ^5.91.2 | IPC-as-server-state + optimistic updates | Already installed; `useSettings.ts` is the canonical pattern |
| date-fns | ^4.1.0 | Date arithmetic for streak calculation, day navigation | Already installed; avoids timezone mistakes |
| lucide-react | ^0.577.0 | Icons (checkboxes, drag handles, arrows, "+" buttons) | Already installed; matches aesthetic |

### New Dependencies Required

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| @dnd-kit/core | ^6.3.1 | Drag-and-drop primitives | Accessibility-first, React 19 compatible, no CSS injection |
| @dnd-kit/sortable | ^10.0.0 | Sortable list abstraction over @dnd-kit/core | Purpose-built for task reorder use case |
| @dnd-kit/utilities | ^3.2.2 | CSS transform helpers for drag items | Required peer utility for sortable |

**Note on @dnd-kit versions:** npm shows `@dnd-kit/core@6.3.1`, `@dnd-kit/sortable@10.0.0`, `@dnd-kit/utilities@3.2.2`. These are confirmed current as of 2026-03-20. (HIGH confidence — verified via `npm view`)

**Toast notifications:** No dedicated library needed. Implement as a lightweight custom toast system (~50 lines) using a Zustand store + fixed-position renderer. The design requires bottom-right position, auto-dismiss, and dark styling matching design tokens — third-party toast libraries (Sonner, react-hot-toast) would require style overrides that fight the custom token system. A minimal hand-rolled implementation is faster and cleaner here.

**Context menus:** No library needed. Implement as a custom positioned `<div>` with a shared hook (`useContextMenu`) that tracks position and target. The menu list, visual style, and positioning logic fit in ~80 lines using the established design tokens.

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dnd-kit | react-beautiful-dnd | react-beautiful-dnd is unmaintained and has React 18/19 issues; @dnd-kit is the successor |
| @dnd-kit | @hello-pangea/dnd | Viable fork of rbd but @dnd-kit has better accessibility and active development |
| Custom toast | sonner ^2.0.7 | Sonner is excellent but styles require override work; custom toast is 50 lines |
| Custom context menu | @radix-ui/react-context-menu | Radix adds ~20KB and its visual defaults fight the handcrafted aesthetic |

---

## Architecture Patterns

### Recommended Project Structure for Phase 2

```
src/
  main/
    ipc/
      habits.ts          # registerHabitsHandlers()
      planner.ts         # registerPlannerHandlers()
      expenses.ts        # registerExpensesHandlers()
      index.ts           # add new handlers to registerAllHandlers()
    repositories/
      HabitRepository.ts
      PlannerRepository.ts
      ExpenseRepository.ts
      WalletRepository.ts
  renderer/
    habits/
      HabitsView.tsx         # module root, connects store to UI
      HabitCard.tsx          # individual habit card with checkbox
      HabitForm.tsx          # inline expandable create/edit form
      habits-store.ts        # Zustand store
    planner/
      PlannerView.tsx        # module root with date nav and tab switcher
      TaskList.tsx           # sortable list with quick-add
      TaskRow.tsx            # individual draggable task row
      TaskForm.tsx           # inline edit form (expand below row)
      DailyNotes.tsx         # debounced textarea
      planner-store.ts       # Zustand store
    expenses/
      ExpensesView.tsx       # module root with sidebar+list layout
      WalletSidebar.tsx      # wallet cards with balance
      ExpenseList.tsx        # chronological list with filter bar
      ExpenseForm.tsx        # modal form for logging
      CategoryManager.tsx    # manage categories (gear section)
      expenses-store.ts      # Zustand store
    shared/
      ContextMenu.tsx        # shared right-click menu component
      ContextMenuProvider.tsx # portal + positioning logic
      Toast.tsx              # toast item component
      ToastContainer.tsx     # fixed bottom-right container
      toast-store.ts         # Zustand store for toast queue
      useContextMenu.ts      # hook: register right-click targets
      useDebounce.ts         # debounce hook (for daily notes)
  shared/
    ipc-types.ts             # EXTEND with HabitsAPI, PlannerAPI, ExpensesAPI
```

### Pattern 1: Repository Class (main process)

**What:** Each module has a class owning all SQL for that domain. Constructor takes the `db` instance.
**When to use:** Always — this is the established architecture.

```typescript
// Source: .planning/research/ARCHITECTURE.md Pattern 2
// src/main/repositories/HabitRepository.ts
import Database from 'better-sqlite3'
import type { Habit } from '../../shared/domain-types'
import { format } from 'date-fns'

export class HabitRepository {
  constructor(private db: Database.Database) {}

  listActive(): Habit[] {
    return this.db.prepare(
      `SELECT id, name, days_of_week as daysOfWeek, archived, created_at as createdAt
       FROM habits WHERE archived = 0 ORDER BY position ASC, created_at ASC`
    ).all() as Habit[]
  }

  listArchived(): Habit[] {
    return this.db.prepare(
      `SELECT id, name, days_of_week as daysOfWeek, archived, created_at as createdAt
       FROM habits WHERE archived = 1 ORDER BY created_at DESC`
    ).all() as Habit[]
  }

  create(data: { name: string; daysOfWeek: string }): Habit {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    this.db.prepare(
      `INSERT INTO habits (id, name, days_of_week, archived, created_at, position)
       VALUES (?, ?, ?, 0, ?, 0)`
    ).run(id, data.name, data.daysOfWeek, now)
    return this.listActive().find(h => h.id === id)!
  }

  update(id: string, data: { name?: string; daysOfWeek?: string }): void {
    if (data.name !== undefined) {
      this.db.prepare(`UPDATE habits SET name = ? WHERE id = ?`).run(data.name, id)
    }
    if (data.daysOfWeek !== undefined) {
      this.db.prepare(`UPDATE habits SET days_of_week = ? WHERE id = ?`).run(data.daysOfWeek, id)
    }
  }

  archive(id: string): void {
    this.db.prepare(`UPDATE habits SET archived = 1 WHERE id = ?`).run(id)
  }

  getCompletionsForDate(date: string): string[] {
    return (this.db.prepare(
      `SELECT habit_id FROM habit_completions WHERE date = ?`
    ).all(date) as { habit_id: string }[]).map(r => r.habit_id)
  }

  markComplete(habitId: string, date: string): void {
    this.db.prepare(
      `INSERT OR IGNORE INTO habit_completions (habit_id, date, value) VALUES (?, ?, 1)`
    ).run(habitId, date)
  }

  markIncomplete(habitId: string, date: string): void {
    this.db.prepare(
      `DELETE FROM habit_completions WHERE habit_id = ? AND date = ?`
    ).run(habitId, date)
  }

  // Returns all completion dates for a habit (for streak calculation)
  getCompletionHistory(habitId: string): string[] {
    return (this.db.prepare(
      `SELECT date FROM habit_completions WHERE habit_id = ? ORDER BY date DESC`
    ).all(habitId) as { date: string }[]).map(r => r.date)
  }
}
```

### Pattern 2: IPC Handler File (main process)

**What:** One file per module in `src/main/ipc/`. Gets `db` via `getDb()` singleton, instantiates repository, registers handles.
**When to use:** Every module. Follow the exact pattern from `settings.ts`.

```typescript
// Source: src/main/ipc/settings.ts (established pattern)
// src/main/ipc/habits.ts
import { ipcMain } from 'electron'
import { getDb } from '../db/connection'
import { HabitRepository } from '../repositories/HabitRepository'
import { calculateStreaks } from '../utils/streaks'

export function registerHabitsHandlers(): void {
  const repo = new HabitRepository(getDb())

  ipcMain.handle('habits:list', () => repo.listActive())
  ipcMain.handle('habits:listArchived', () => repo.listArchived())
  ipcMain.handle('habits:create', (_, data) => repo.create(data))
  ipcMain.handle('habits:update', (_, { id, ...data }) => repo.update(id, data))
  ipcMain.handle('habits:archive', (_, id) => repo.archive(id))

  ipcMain.handle('habits:getToday', (_, date: string) => {
    const habits = repo.listActive()
    const completedIds = repo.getCompletionsForDate(date)
    return habits.map(h => ({
      ...h,
      completedToday: completedIds.includes(h.id),
      ...calculateStreaks(h, repo.getCompletionHistory(h.id)),
    }))
  })

  ipcMain.handle('habits:complete', (_, { habitId, date }) => {
    repo.markComplete(habitId, date)
    const history = repo.getCompletionHistory(habitId)
    const habit = repo.listActive().find(h => h.id === habitId)!
    return calculateStreaks(habit, history)
  })

  ipcMain.handle('habits:uncomplete', (_, { habitId, date }) => {
    repo.markIncomplete(habitId, date)
    const history = repo.getCompletionHistory(habitId)
    const habit = repo.listActive().find(h => h.id === habitId)!
    return calculateStreaks(habit, history)
  })
}
```

### Pattern 3: Zustand Store with Optimistic Updates (renderer)

**What:** Store owns async IPC calls. Write actions do optimistic update first, then IPC, then rollback on error.
**When to use:** Every module write action. This is the core of the sub-100ms feel.

```typescript
// Source: .planning/research/ARCHITECTURE.md Pattern 3 (extended)
// src/renderer/habits/habits-store.ts
import { create } from 'zustand'
import type { Habit } from '../../shared/domain-types'
import { addToast } from '../shared/toast-store'

interface HabitWithToday extends Habit {
  completedToday: boolean
  currentStreak: number
  bestStreak: number
}

interface HabitsStore {
  habits: HabitWithToday[]
  isLoaded: boolean
  showArchived: boolean
  load: (date: string) => Promise<void>
  toggleComplete: (habitId: string, date: string) => Promise<void>
  createHabit: (data: { name: string; daysOfWeek: string }) => Promise<void>
  updateHabit: (id: string, data: { name?: string; daysOfWeek?: string }) => Promise<void>
  archiveHabit: (id: string) => Promise<void>
  setShowArchived: (show: boolean) => void
}

export const useHabitsStore = create<HabitsStore>((set, get) => ({
  habits: [],
  isLoaded: false,
  showArchived: false,

  load: async (date) => {
    const habits = await window.api.habits.getToday(date)
    set({ habits, isLoaded: true })
  },

  toggleComplete: async (habitId, date) => {
    const { habits } = get()
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    const wasCompleted = habit.completedToday
    // Optimistic update
    set({
      habits: habits.map(h =>
        h.id === habitId ? { ...h, completedToday: !wasCompleted } : h
      )
    })

    try {
      const streaks = wasCompleted
        ? await window.api.habits.uncomplete({ habitId, date })
        : await window.api.habits.complete({ habitId, date })
      // Update with confirmed streak data
      set({
        habits: get().habits.map(h =>
          h.id === habitId ? { ...h, ...streaks } : h
        )
      })
    } catch (err) {
      // Rollback optimistic update
      set({
        habits: get().habits.map(h =>
          h.id === habitId ? { ...h, completedToday: wasCompleted } : h
        )
      })
      addToast({ type: 'error', message: 'Failed to update habit. Please try again.' })
    }
  },

  createHabit: async (data) => {
    try {
      await window.api.habits.create(data)
      await get().load(new Date().toISOString().split('T')[0])
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to create habit.' })
    }
  },

  updateHabit: async (id, data) => {
    try {
      await window.api.habits.update({ id, ...data })
      await get().load(new Date().toISOString().split('T')[0])
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update habit.' })
    }
  },

  archiveHabit: async (id) => {
    const { habits } = get()
    // Optimistic: remove from list
    set({ habits: habits.filter(h => h.id !== id) })
    try {
      await window.api.habits.archive(id)
    } catch (err) {
      set({ habits }) // rollback
      addToast({ type: 'error', message: 'Failed to archive habit.' })
    }
  },

  setShowArchived: (show) => set({ showArchived: show }),
}))
```

### Pattern 4: SQLite Transaction for Atomic Wallet Deduction

**What:** Expense creation must atomically INSERT the expense AND UPDATE wallet balance. Use `db.transaction()`.
**When to use:** Any operation touching two tables simultaneously (expense create, edit, delete).

```typescript
// Source: better-sqlite3 docs — transaction API
// src/main/repositories/ExpenseRepository.ts (critical section)
createExpense(data: {
  amount: number; date: string; categoryId: string;
  walletId: string; notes: string | null
}) {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const tx = this.db.transaction(() => {
    this.db.prepare(
      `INSERT INTO expenses (id, amount, date, category_id, wallet_id, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, data.amount, data.date, data.categoryId, data.walletId, data.notes, now)

    // Deduct from wallet (amount is stored as integer cents)
    this.db.prepare(
      `UPDATE wallets SET balance = balance - ? WHERE id = ?`
    ).run(data.amount, data.walletId)
  })

  tx() // executes atomically
  return id
}

deleteExpense(id: string) {
  const expense = this.db.prepare(
    `SELECT wallet_id, amount FROM expenses WHERE id = ?`
  ).get(id) as { wallet_id: string; amount: number } | undefined

  if (!expense) return

  const tx = this.db.transaction(() => {
    this.db.prepare(`DELETE FROM expenses WHERE id = ?`).run(id)
    if (expense.wallet_id) {
      // Reverse the deduction
      this.db.prepare(
        `UPDATE wallets SET balance = balance + ? WHERE id = ?`
      ).run(expense.amount, expense.wallet_id)
    }
  })
  tx()
}

editExpense(id: string, data: {
  amount: number; date: string; categoryId: string;
  walletId: string; notes: string | null
}) {
  const original = this.db.prepare(
    `SELECT wallet_id, amount FROM expenses WHERE id = ?`
  ).get(id) as { wallet_id: string; amount: number }

  const tx = this.db.transaction(() => {
    // Reverse original deduction
    if (original.wallet_id) {
      this.db.prepare(
        `UPDATE wallets SET balance = balance + ? WHERE id = ?`
      ).run(original.amount, original.wallet_id)
    }
    // Apply new deduction
    this.db.prepare(
      `UPDATE wallets SET balance = balance - ? WHERE id = ?`
    ).run(data.amount, data.walletId)
    // Update expense record
    this.db.prepare(
      `UPDATE expenses SET amount=?, date=?, category_id=?, wallet_id=?, notes=? WHERE id=?`
    ).run(data.amount, data.date, data.categoryId, data.walletId, data.notes, id)
  })
  tx()
}
```

### Pattern 5: Streak Calculation (main process utility)

**What:** Streaks count only SCHEDULED days. A habit scheduled Mon/Wed/Fri with completions Mon+Wed but missed Fri breaks the streak on the next scheduled day (Sat or Sun do NOT break it).
**When to use:** Called by `habits:getToday` and `habits:complete` IPC handlers.

The `days_of_week` field is a 7-character bitmask string `'1111111'` where index 0 = Sunday, 1 = Monday, ..., 6 = Saturday (matches `getDay()` return values).

```typescript
// src/main/utils/streaks.ts
import { parseISO, differenceInCalendarDays, subDays, format } from 'date-fns'
import type { Habit } from '../../shared/domain-types'

/** Returns true if the habit is scheduled on the given ISO date string */
export function isScheduledOn(habit: Habit, dateStr: string): boolean {
  const date = parseISO(dateStr)
  const dayIndex = date.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  return habit.daysOfWeek[dayIndex] === '1'
}

/** Get today's date as YYYY-MM-DD (local date, not UTC) */
export function getTodayStr(): string {
  const now = new Date()
  return format(now, 'yyyy-MM-dd')
}

export function calculateStreaks(
  habit: Habit,
  completionDates: string[] // sorted descending by the SQL query
): { currentStreak: number; bestStreak: number } {
  if (completionDates.length === 0) return { currentStreak: 0, bestStreak: 0 }

  const completedSet = new Set(completionDates)

  // Build ordered list of scheduled days going back from today
  const todayStr = getTodayStr()
  const today = parseISO(todayStr)

  let currentStreak = 0
  let checking = today
  let consecutiveMisses = 0

  // Walk backwards through calendar days
  for (let i = 0; i < 730; i++) { // max 2 years back
    const dateStr = format(checking, 'yyyy-MM-dd')
    const scheduled = isScheduledOn(habit, dateStr)

    if (scheduled) {
      if (completedSet.has(dateStr)) {
        currentStreak++
        consecutiveMisses = 0
      } else {
        // Missed a scheduled day — streak breaks (unless it's today, grace)
        if (i === 0) {
          // Today hasn't been completed yet — don't break streak yet
        } else {
          break
        }
      }
    }
    checking = subDays(checking, 1)
    if (i > completionDates.length + 7) break // pruning: won't find more completions
  }

  // Best streak: walk entire history
  let bestStreak = 0
  let runningStreak = 0
  // Sort completions ascending for best streak scan
  const sorted = [...completionDates].sort()
  for (const dateStr of sorted) {
    if (isScheduledOn(habit, dateStr)) {
      runningStreak++
      if (runningStreak > bestStreak) bestStreak = runningStreak
    }
    // Note: best streak algorithm needs gap detection — simplified version above
    // Full implementation: check if previous scheduled day was also completed
  }

  return { currentStreak, bestStreak: Math.max(bestStreak, currentStreak) }
}
```

**CRITICAL NOTE:** The streak algorithm above is a starting point. The planner must specify the exact edge case behavior (grace period for today, what happens when you check off a previously-missed day). The unit tests are the ground truth for this logic.

### Pattern 6: @dnd-kit/sortable for Task Reordering

**What:** Wrap the task list in `SortableContext`, wrap each task row in `useSortable`.
**When to use:** Planner task list only.

```typescript
// Source: @dnd-kit/sortable official docs
// src/renderer/planner/TaskList.tsx (structure)
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'

function TaskList({ tasks, onReorder }: { tasks: Task[]; onReorder: (ids: string[]) => void }) {
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 } // 5px drag threshold prevents accidental drags
  }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = tasks.findIndex(t => t.id === active.id)
    const newIndex = tasks.findIndex(t => t.id === over.id)
    const reordered = arrayMove(tasks, oldIndex, newIndex)
    onReorder(reordered.map(t => t.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map(task => <TaskRow key={task.id} task={task} />)}
      </SortableContext>
    </DndContext>
  )
}

// src/renderer/planner/TaskRow.tsx (sortable wrapper)
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function TaskRow({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Drag handle — only this element gets listeners, not the whole row */}
      <span {...listeners} style={{ cursor: 'grab' }}>
        {/* drag handle icon */}
      </span>
      {/* rest of task row */}
    </div>
  )
}
```

### Pattern 7: IPC-Types Extension (shared)

**What:** Uncomment and define the module API interfaces in `src/shared/ipc-types.ts`. Add to `API` interface.

```typescript
// src/shared/ipc-types.ts — additions for Phase 2
import type { Habit, Task, Category, Wallet, Expense } from './domain-types'

export interface HabitWithToday extends Habit {
  completedToday: boolean
  currentStreak: number
  bestStreak: number
}

export interface HabitsAPI {
  getToday: (date: string) => Promise<HabitWithToday[]>
  listArchived: () => Promise<Habit[]>
  create: (data: { name: string; daysOfWeek: string }) => Promise<Habit>
  update: (data: { id: string; name?: string; daysOfWeek?: string }) => Promise<void>
  archive: (id: string) => Promise<void>
  complete: (data: { habitId: string; date: string }) => Promise<{ currentStreak: number; bestStreak: number }>
  uncomplete: (data: { habitId: string; date: string }) => Promise<{ currentStreak: number; bestStreak: number }>
}

export interface TaskWithDate extends Task {
  // Task type from domain-types.ts already has all needed fields
}

export interface PlannerAPI {
  listForDate: (date: string) => Promise<Task[]>
  create: (data: { title: string; notes?: string; date: string }) => Promise<Task>
  update: (data: { id: string; title?: string; notes?: string; date?: string; completed?: boolean }) => Promise<void>
  delete: (id: string) => Promise<void>
  reorder: (data: { ids: string[]; date: string }) => Promise<void>
  getNotes: (date: string) => Promise<string>
  saveNotes: (data: { date: string; content: string }) => Promise<void>
}

export interface ExpensesAPI {
  listExpenses: (filters?: { startDate?: string; endDate?: string; categoryId?: string }) => Promise<Expense[]>
  createExpense: (data: { amount: number; date: string; categoryId: string; walletId: string; notes?: string }) => Promise<string>
  updateExpense: (data: { id: string; amount: number; date: string; categoryId: string; walletId: string; notes?: string }) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  listCategories: () => Promise<Category[]>
  createCategory: (data: { name: string; color: string }) => Promise<Category>
  updateCategory: (data: { id: string; name?: string; color?: string }) => Promise<void>
  deleteCategory: (id: string) => Promise<boolean> // false if in use
  listWallets: () => Promise<Wallet[]>
  createWallet: (data: { name: string; balance: number }) => Promise<Wallet>
  updateWallet: (data: { id: string; name?: string }) => Promise<void>
  adjustWalletBalance: (data: { id: string; mode: 'set' | 'delta'; amount: number }) => Promise<void>
  deleteWallet: (id: string) => Promise<boolean> // false if has expenses
}

export interface API {
  settings: SettingsAPI
  window: WindowAPI
  habits: HabitsAPI    // uncommented
  planner: PlannerAPI  // uncommented
  expenses: ExpensesAPI // uncommented
}
```

### Pattern 8: ModuleHeader Extension

**What:** Current `ModuleHeader` only shows a title. Phase 2 needs module-specific controls (tabs, "+" button, date nav, archive toggle). Extend via optional props.
**When to use:** HabitsView, PlannerView, ExpensesView all customize the header.

```typescript
// Extension approach for ModuleHeader.tsx
interface ModuleHeaderProps {
  moduleId: ModuleId
  left?: React.ReactNode   // planner: date nav arrows + label
  right?: React.ReactNode  // planner: tabs; habits: "+" + archive toggle; expenses: "+"
}
```

### Anti-Patterns to Avoid

- **Separate loading states per IPC call instead of one store `isLoaded` flag:** Causes loading spinners scattered across UI. Use one `isLoaded` flag per store module.
- **Calling `new Date()` directly in streak logic:** Always use `getTodayStr()` canonical function. Timezone drift will corrupt streaks.
- **Expense-wallet deduction outside a transaction:** If the INSERT succeeds and the UPDATE fails, wallet balance is wrong. Always use `db.transaction()` for multi-table writes.
- **Passing raw `db` instance to IPC handlers:** The repository class is the boundary. IPC handlers only call repository methods, never `db` directly.
- **Storing amounts as floats:** Balances and amounts are stored as integer cents already in the schema. The ₱150.50 display requires dividing by 100 for display only.
- **Re-fetching all habits after every toggle:** The `toggleComplete` return value from IPC already includes updated streak data. Apply it to the existing store array — don't reload the entire list.
- **DnD wrapping completed tasks:** Completed tasks sink to bottom and are not reorderable. Only apply `SortableContext` to the incomplete task subset.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop list reordering | Custom mousedown/mousemove handlers | @dnd-kit/sortable | Accessibility (keyboard DnD), touch support, auto-scroll, collision detection are non-trivial |
| Date arithmetic for streaks | Custom day-counting loops | date-fns `parseISO`, `subDays`, `differenceInCalendarDays`, `format` | DST edge cases, leap years, locale-specific week starts — already installed |
| SQLite multi-table atomicity | Manual try/catch with compensating writes | `db.transaction()` (better-sqlite3) | Transactions are atomic by definition; compensating writes are bug-prone |
| Unique IDs for new records | `Date.now().toString()` or `Math.random()` | `crypto.randomUUID()` | Node.js built-in, RFC 4122 compliant, no collisions |
| Amount formatting (₱150 vs ₱150.50) | Conditional string interpolation everywhere | Dedicated `formatPeso(cents: number): string` utility | Keeps display logic in one testable place |

**Key insight:** The most dangerous hand-roll in this phase is streak calculation. The algorithm sounds simple ("count consecutive completed days") but the scheduled-days-only requirement means the comparison is against a derived set of expected days, not raw calendar days. Write unit tests for this function before any UI work.

---

## Common Pitfalls

### Pitfall 1: Streak Timezone Drift
**What goes wrong:** `new Date().toISOString()` returns UTC. A user in UTC+8 at 11 PM local time gets a date string for "tomorrow" in UTC. Their completed habit is attributed to the wrong day, breaking the streak.
**Why it happens:** JavaScript `Date` UTC vs local time confusion.
**How to avoid:** Use `format(new Date(), 'yyyy-MM-dd')` from date-fns (returns LOCAL date string) for the canonical today date. Store completion dates as local `YYYY-MM-DD`, not UTC timestamps.
**Warning signs:** Using `.toISOString().split('T')[0]` — this returns UTC date, not local date.

### Pitfall 2: Wallet Balance Race Condition (not applicable in this architecture)
**What goes wrong:** (In async architectures) Two expense logs in parallel both read balance, both deduct, one deduction is lost.
**Why it doesn't apply here:** better-sqlite3 is synchronous and single-connection. IPC handlers run sequentially in Node.js event loop. SQLite transactions still required for atomicity between INSERT + UPDATE, but no race condition is possible.
**How to avoid:** Still use `db.transaction()` for correctness guarantees and atomicity.

### Pitfall 3: Context Menu Portal Z-Index and Positioning
**What goes wrong:** Right-click menu renders inside a scrollable container, gets clipped by `overflow: hidden`. Menu appears at wrong position when parent has `position: relative`.
**Why it happens:** Fixed-position elements need to escape the scroll container.
**How to avoid:** Render context menus in a React portal attached to `document.body`. Calculate menu position from `event.clientX/Y` (viewport coordinates). Adjust for viewport edges (flip above/left if too close to screen edge).

### Pitfall 4: @dnd-kit Breaking Completed Task Ordering
**What goes wrong:** Completed tasks are in the same `SortableContext` as incomplete tasks. User accidentally drags a completed task above incomplete ones, or reorder IPC call saves wrong positions.
**Why it happens:** The DnD context doesn't know about the "completed = sink to bottom" rule.
**How to avoid:** Separate the task array into two arrays before rendering: `incompleteTasks` and `completedTasks`. Only `incompleteTasks` is inside `SortableContext`. `completedTasks` renders below with no drag capability.

### Pitfall 5: Expense Amount Integer/Float Confusion
**What goes wrong:** User types "150.50". This is stored as `150.50` (float) in the expense. The schema defines `amount INTEGER`. SQLite silently truncates to `150`. Balance is wrong.
**Why it happens:** The amount input returns a float string. Developer passes `parseFloat(input)` to IPC without converting to cents.
**How to avoid:** Convert input to integer cents at the form level: `Math.round(parseFloat(input) * 100)`. The IPC layer and repository always operate in cents. Display layer divides by 100. This is already consistent with the `balance INTEGER` column in wallets.

### Pitfall 6: ModuleHeader Shared State Leaking Between Modules
**What goes wrong:** Planner's date navigation state (current viewed date) persists when switching to Habits and back. "Today" highlight and task count show stale data.
**Why it happens:** Planner store's `viewDate` is never reset when module is unmounted.
**How to avoid:** PlannerStore `viewDate` should default to today. Reset it to today when the planner module mounts (or don't reset it — remembering last viewed date is a feature). Define this behavior explicitly in plans.

### Pitfall 7: Missing Error Boundaries Per Module
**What goes wrong:** A runtime error in ExpensesView crashes the entire React tree. Habits and Planner become inaccessible.
**Why it happens:** React's default behavior propagates errors up to the nearest error boundary.
**How to avoid:** Wrap each module view (`HabitsView`, `PlannerView`, `ExpensesView`) in a React `ErrorBoundary` component with a module-level fallback ("Something went wrong in Expenses. Other modules are unaffected.").

---

## Code Examples

Verified patterns from official/existing sources:

### better-sqlite3 Transaction (atomic wallet deduction)
```typescript
// Source: better-sqlite3 README — transaction API
const transfer = db.transaction((amount: number, walletId: string) => {
  const expense = db.prepare(
    'INSERT INTO expenses (...) VALUES (...)'
  ).run(...)
  db.prepare(
    'UPDATE wallets SET balance = balance - ? WHERE id = ?'
  ).run(amount, walletId)
})
transfer(1500, 'wallet-uuid') // runs atomically
```

### date-fns Local Date String (correct timezone handling)
```typescript
// Source: date-fns docs + verified in installed v4.1.0
import { format } from 'date-fns'

// CORRECT — local date
const today = format(new Date(), 'yyyy-MM-dd') // '2026-03-20' in local TZ

// WRONG — UTC date
const utcWrong = new Date().toISOString().split('T')[0] // may return tomorrow in UTC+14
```

### Zustand optimistic update with rollback
```typescript
// Source: Zustand docs + .planning/research/ARCHITECTURE.md Pattern 3
toggleComplete: async (habitId, date) => {
  const snapshot = get().habits // capture before change
  set({ habits: snapshot.map(h => h.id === habitId
    ? { ...h, completedToday: !h.completedToday } : h) })
  try {
    await window.api.habits.complete({ habitId, date })
  } catch {
    set({ habits: snapshot }) // exact rollback
    addToast({ type: 'error', message: 'Failed to save.' })
  }
}
```

### debounced auto-save for daily notes
```typescript
// Source: settings auto-save pattern from Phase 1 (src/renderer/settings/useSettings.ts)
import { useCallback, useEffect, useRef } from 'react'

function useDebouncedSave(value: string, onSave: (v: string) => void, delay = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSave(value), delay)
    return () => clearTimeout(timerRef.current)
  }, [value, delay, onSave])
}
```

### Amount display formatting
```typescript
// Utility function — formatPeso(cents: number): string
export function formatPeso(cents: number): string {
  const pesos = cents / 100
  // Hide decimals if whole number
  if (pesos % 1 === 0) return `₱${pesos.toFixed(0)}`
  return `₱${pesos.toFixed(2)}`
}
// formatPeso(15000) → '₱150'
// formatPeso(15050) → '₱150.50'
```

### Default categories seed (first run)
```typescript
// Run in habits:init or a dedicated expenses:seedDefaults IPC handler
const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#f97316' },      // orange
  { name: 'Transport', color: '#3b82f6' }, // blue
  { name: 'Bills', color: '#ef4444' },     // red
  { name: 'Entertainment', color: '#a855f7' }, // purple
  { name: 'Shopping', color: '#ec4899' },  // pink
  { name: 'Health', color: '#22c55e' },    // green
  { name: 'Other', color: '#6b7280' },     // gray
]
// Check if categories table is empty before seeding
const count = db.prepare('SELECT COUNT(*) as n FROM categories').get() as { n: number }
if (count.n === 0) {
  for (const cat of DEFAULT_CATEGORIES) {
    db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)').run(
      crypto.randomUUID(), cat.name, cat.color
    )
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | @dnd-kit/sortable | 2022 (rbd deprecated) | rbd has React 18+ issues; @dnd-kit is the standard |
| moment.js | date-fns | 2020+ | moment deprecated; date-fns is tree-shakeable, functional |
| Redux for all state | Zustand per module | 2021-2023 | Less boilerplate, no Provider hell, better DX |
| Class components + lifecycle | Functional components + hooks | React 16.8+ (2019) | Already using hooks throughout |

**Deprecated/outdated:**
- `react-beautiful-dnd`: Unmaintained since 2023. Do not use. @dnd-kit is the replacement.
- `moment.js`: Already correctly excluded. date-fns v4.1.0 is installed.
- `ipcRenderer.sendSync` / `ipcMain.on` + `event.returnValue`: Never use synchronous IPC. Already using `ipcMain.handle` pattern correctly.

---

## Open Questions

1. **Streak calculation: grace period for today**
   - What we know: streak counts consecutive SCHEDULED days. If today is a scheduled day and the user hasn't checked off yet, does the current streak show the count INCLUDING today (assuming they'll do it) or excluding today (they haven't yet)?
   - What's unclear: the exact UX — "streak: 7" vs "streak: 6 (check off to maintain)"
   - Recommendation: Show existing streak (excluding today). Today's check-off increments it. This is less presumptuous and more motivating.

2. **Task position after reorder — persistence strategy**
   - What we know: tasks have a `position INTEGER` column. Reorder IPC call should update positions.
   - What's unclear: do we re-number all positions on every reorder (1, 2, 3, 4...) or use sparse numbering? Re-numbering requires N updates; sparse insertion requires one.
   - Recommendation: Re-number sequentially on every reorder. At most 50-100 tasks per day — N updates in a transaction is instant with better-sqlite3.

3. **Expense filter bar — date range picker implementation**
   - What we know: needs start date + end date inputs, marked as Claude's discretion.
   - What's unclear: native `<input type="date">` vs custom date picker component.
   - Recommendation: Use native `<input type="date">` elements styled with CSS to match design tokens. Avoids a dependency and works well on desktop Electron where browser compatibility is a known Chromium version.

4. **When to seed default categories**
   - What we know: categories must be seeded on first run.
   - What's unclear: which IPC handler or app event triggers the seed.
   - Recommendation: Seed in the `registerExpensesHandlers()` function, run-once guard checking `SELECT COUNT(*)` from categories table. Runs at app startup before any UI is rendered.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` (exists at project root — confirmed) |
| Quick run command | `npx vitest run tests/[file].test.ts --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HAB-02 | Optimistic toggle updates store before IPC resolves | unit | `npx vitest run tests/habits-store.test.ts -t "optimistic"` | ❌ Wave 0 |
| HAB-03 | Streak counts only scheduled days; missed unscheduled days don't break streak | unit | `npx vitest run tests/streaks.test.ts` | ❌ Wave 0 |
| HAB-03 | Streak resets when scheduled day is missed | unit | `npx vitest run tests/streaks.test.ts -t "reset"` | ❌ Wave 0 |
| HAB-05 | isScheduledOn correctly reads bitmask for each day of week | unit | `npx vitest run tests/streaks.test.ts -t "scheduled"` | ❌ Wave 0 |
| PLAN-05 | Task reorder updates position values in correct order | unit | `npx vitest run tests/planner-repository.test.ts -t "reorder"` | ❌ Wave 0 |
| EXP-07 | Expense creation deducts wallet balance atomically | unit | `npx vitest run tests/expense-repository.test.ts -t "deduction"` | ❌ Wave 0 |
| EXP-07 | Expense deletion reverses wallet deduction | unit | `npx vitest run tests/expense-repository.test.ts -t "delete reversal"` | ❌ Wave 0 |
| EXP-07 | Expense edit reverses old deduction and applies new one | unit | `npx vitest run tests/expense-repository.test.ts -t "edit reversal"` | ❌ Wave 0 |
| HAB-01 | formatPeso hides decimals when cents = 00, shows when not | unit | `npx vitest run tests/format-peso.test.ts` | ❌ Wave 0 |

**Note on repository tests:** `better-sqlite3` cannot run in jsdom environment (native Node module). Repository tests must use `environment: 'node'` or a vitest per-file `@vitest-environment node` comment. This is a Wave 0 setup requirement.

### Sampling Rate
- **Per task commit:** Run the specific test file for that task
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/streaks.test.ts` — covers HAB-03, HAB-05: streak calculation unit tests with timezone edge cases, scheduled-only counting, reset behavior, best streak tracking
- [ ] `tests/habits-store.test.ts` — covers HAB-02: optimistic update applies before IPC, rollback on error
- [ ] `tests/expense-repository.test.ts` — covers EXP-07, EXP-08: wallet deduction atomicity, delete reversal, edit reversal (requires `@vitest-environment node`)
- [ ] `tests/planner-repository.test.ts` — covers PLAN-05: reorder positions persist correctly (requires `@vitest-environment node`)
- [ ] `tests/format-peso.test.ts` — covers display formatting (₱150 vs ₱150.50)
- [ ] `tests/vitest-node-setup.md` — document how to annotate repository tests with `// @vitest-environment node` to bypass jsdom for better-sqlite3

---

## Sources

### Primary (HIGH confidence)
- `D:/projects/Portfolio Projects/monolith/package.json` — verified installed versions: better-sqlite3 ^12.8.0, date-fns ^4.1.0, zustand ^5.0.12, @tanstack/react-query ^5.91.2, lucide-react ^0.577.0
- `D:/projects/Portfolio Projects/monolith/src/main/db/migrations.ts` — confirmed all tables exist in migration v1: habits, habit_completions, tasks, daily_notes, categories, wallets, expenses
- `D:/projects/Portfolio Projects/monolith/src/shared/domain-types.ts` — confirmed type definitions align with schema
- `D:/projects/Portfolio Projects/monolith/vitest.config.ts` — confirmed test infrastructure exists (jsdom, globals, `tests/**/*.test.{ts,tsx}`)
- `npm view @dnd-kit/core version` → 6.3.1 (confirmed 2026-03-20)
- `npm view @dnd-kit/sortable version` → 10.0.0 (confirmed 2026-03-20)
- `npm view @dnd-kit/utilities version` → 3.2.2 (confirmed 2026-03-20)

### Secondary (MEDIUM confidence)
- `.planning/research/ARCHITECTURE.md` — IPC handler pattern, repository pattern, optimistic update pattern (Phase 1 research)
- `.planning/research/PITFALLS.md` — streak timezone pitfall, SQLite transaction atomicity, error boundary requirement
- `.planning/research/STACK.md` — library rationale for established choices
- `src/renderer/settings/useSettings.ts` — established TanStack Query + optimistic update pattern to replicate
- `src/main/ipc/settings.ts` — established IPC handler pattern to replicate

### Tertiary (LOW confidence — verify if used)
- @dnd-kit/sortable API shape: based on training data + official docs pattern. Verify against installed version if API has changed.
- date-fns v4 TZ handling: v4 may have changed the `format` function behavior. The key claim (format uses local time) is consistent with v2/v3/v4 behavior but should be confirmed with a quick test.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified against installed package.json and npm registry
- Architecture: HIGH — patterns directly replicate established Phase 1 code
- Streak algorithm: MEDIUM — algorithm is correct in principle; exact edge cases (today grace period) need explicit unit test specification
- DnD integration: MEDIUM — @dnd-kit API based on training data; verify against installed v6.3.1/v10.0.0
- Wallet atomicity: HIGH — better-sqlite3 transaction API is stable and well-documented

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable ecosystem — 30 days)
