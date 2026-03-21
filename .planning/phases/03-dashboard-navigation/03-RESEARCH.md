# Phase 3: Dashboard + Navigation - Research

**Researched:** 2026-03-21
**Domain:** Electron + React — dashboard aggregation IPC, command palette, focus management
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Dashboard layout**
- D-01: Stacked full-width cards — habits on top, tasks in middle, spending at bottom
- D-02: Habits card: "3/5 done" progress bar + 1-2 habits with notable streaks highlighted
- D-03: Tasks card: up to 3-5 incomplete tasks for today with titles, "2 remaining" count
- D-04: Spending card: "₱450 today" headline + top 2-3 categories with amounts
- D-05: Date header at top — "Friday, March 21" format, clean and informational, no greeting

**Dashboard interactions**
- D-06: View-only dashboard — clicking a card navigates to that module
- D-07: Empty module state: card still shows with muted message. Card remains clickable
- D-08: Overdue tasks badge on the tasks card — "2 overdue" count in warning color if incomplete tasks exist from previous days
- D-09: Ctrl+K opens a command palette with options: "Add task", "Log expense", "Check habit"
- D-10: Type-to-filter in the palette, Enter to select
- D-11: Selecting an action navigates to the module and focuses the add input / opens the modal
- D-12: "N" key behavior unchanged — still adds to active module (fast path)

**Keyboard accessibility**
- D-13: Sidebar is NOT keyboard-focusable — Alt+1-4 is the keyboard path for module switching (already implemented)
- D-14: Focus indicators: 2px accent-colored ring on focused elements, using --color-accent token
- D-15: Tab cycles through interactive elements within the active module view. Context menus remain mouse-triggered
- D-16: `?` shortcut overlay updated with ALL shortcuts from Phases 1-3, grouped by category

### Claude's Discretion
- Command palette visual design (size, position, animation)
- Exact dashboard card spacing and styling within the stacked layout
- How many streak highlights to show in the habits card (1-2)
- How many incomplete tasks to show in the tasks card (3-5)
- How many category breakdowns to show in the spending card (2-3)
- Focus ring exact styling (offset, color opacity)
- Shortcut overlay categorization and grouping labels

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SHELL-01 | Dashboard shows today's habits, tasks, and spending at a glance | New `dashboard:getToday` IPC handler aggregates from three repositories; DashboardView renders three summary cards |
| SHELL-02 | Sidebar navigation between dashboard and modules | Sidebar already implemented; dashboard card click-to-navigate pattern confirmed from App.tsx; `aria-current="page"` already present |
| KBD-01 | Full keyboard navigation across all modules | Tab order enforcement via `:focus-visible` ring; `--color-warning` token addition; no keyboard focus on sidebar (D-13) |
| KBD-02 | Quick-add shortcuts for tasks, expenses, and habit check-offs | Ctrl+K CommandPalette mounted at app level; navigates to module and triggers `newItemTrigger` counter pattern |
| KBD-03 | Press `?` to view keyboard shortcut reference | Existing KeyboardShortcutOverlay updated with three sections and all Phase 1-3 shortcuts |
</phase_requirements>

---

## Summary

Phase 3 wires three things together: a dashboard that reads real data, a command palette for cross-module quick-add, and comprehensive keyboard focus management. The codebase is already well-structured for all three. The IPC pattern (ipcMain.handle + contextBridge + TanStack Query) is established and consistent across all three modules. The KeyboardRouter is already the right extension point for Ctrl+K. The biggest implementation decision is whether the dashboard IPC handler aggregates in a single SQL query or calls each module's repository separately — separate calls are simpler and safe given SQLite's synchronous nature.

The phase divides naturally into three independent plans: (1) the IPC data layer, (2) the DashboardView UI, and (3) the CommandPalette + keyboard completions. Plans 1 and 3 have no UI dependencies; plan 2 depends on plan 1's IPC channel.

**Primary recommendation:** Implement `dashboard:getToday` as a new IPC handler in `src/main/ipc/dashboard.ts` that calls each module's repository directly — no new SQL queries needed, just compose from existing repository methods. Mount CommandPalette at app level alongside KeyboardShortcutOverlay. Add `--color-warning` token to globals.css before writing any component that uses it.

---

## Standard Stack

### Core (already installed — no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| better-sqlite3 | ^12.8.0 | Synchronous SQLite reads for dashboard aggregation | Already in use for all three module repos |
| @tanstack/react-query | ^5.91.2 | IPC-as-server-state for dashboard data with staleTime | Established pattern for all module stores |
| zustand | ^5.0.12 | Local UI state (command palette open/close) | Per-module store pattern already established |
| lucide-react | ^0.577.0 | Icons (size=18, strokeWidth=1.5) | Established standard across all views |

### No New Packages Required

The entire phase is implemented with libraries already in package.json. No npm installs needed.

---

## Architecture Patterns

### Recommended Project Structure (new files only)

```
src/
├── main/
│   └── ipc/
│       └── dashboard.ts          # New: dashboard:getToday handler
├── renderer/
│   └── dashboard/
│       ├── DashboardView.tsx     # New: three-card summary view
│       ├── HabitsCard.tsx        # New: habits summary card
│       ├── TasksCard.tsx         # New: tasks summary card
│       └── SpendingCard.tsx      # New: spending summary card
│   └── shell/
│       ├── CommandPalette.tsx    # New: Ctrl+K palette
│       ├── KeyboardRouter.tsx    # Modified: add Ctrl+K handler
│       └── KeyboardShortcutOverlay.tsx  # Modified: full shortcut list
└── shared/
    └── ipc-types.ts              # Modified: add DashboardAPI
```

### Pattern 1: Dashboard IPC Handler

The dashboard IPC handler aggregates data from three existing repositories. All repositories accept the database connection from `getDb()`. SQLite reads are synchronous in better-sqlite3, so no async coordination is needed.

```typescript
// src/main/ipc/dashboard.ts
import { ipcMain } from 'electron'
import { getDb } from '../db/connection'
import { HabitRepository } from '../repositories/HabitRepository'
import { PlannerRepository } from '../repositories/PlannerRepository'
import { ExpenseRepository } from '../repositories/ExpenseRepository'
import { calculateStreaks } from '../utils/streaks'

export interface DashboardData {
  habits: {
    total: number          // active habits scheduled for today's day-of-week
    completed: number      // completed today
    streakHighlights: Array<{ name: string; currentStreak: number }>
  }
  tasks: {
    todayIncomplete: Array<{ id: string; title: string }>
    totalIncomplete: number
    overdueCount: number   // incomplete tasks with date < today
  }
  spending: {
    todayTotal: number
    topCategories: Array<{ name: string; color: string; amount: number }>
  }
}

export function registerDashboardHandlers(): void {
  ipcMain.handle('dashboard:getToday', (_, date: string) => {
    const db = getDb()
    // ... aggregate from repositories
  })
}
```

Key implementation notes:
- `date` parameter is `YYYY-MM-DD` string (same convention as all other handlers)
- Habits: filter active habits by `daysOfWeek` for today's day-of-week (0=Sunday, matches JS `Date.getDay()`)
- Tasks overdue: `SELECT COUNT(*) FROM tasks WHERE date < ? AND completed = 0` — one extra query
- Spending today: `SELECT SUM(amount), category_id FROM expenses WHERE date = ? GROUP BY category_id` — join with categories for name/color
- Return plain serializable object (no class instances)

### Pattern 2: IPC Types Extension

Add `DashboardAPI` to `ipc-types.ts` and preload `index.ts` following the exact pattern of existing modules:

```typescript
// ipc-types.ts addition
export interface DashboardAPI {
  getToday: (date: string) => Promise<DashboardData>
}

export interface API {
  settings: SettingsAPI
  window: WindowAPI
  habits: HabitsAPI
  planner: PlannerAPI
  expenses: ExpensesAPI
  dashboard: DashboardAPI   // add here
}
```

```typescript
// preload/index.ts addition
dashboard: {
  getToday: (date) => ipcRenderer.invoke('dashboard:getToday', date),
},
```

Register in `src/main/ipc/index.ts`:
```typescript
import { registerDashboardHandlers } from './dashboard'
// add to registerAllHandlers():
registerDashboardHandlers()
```

### Pattern 3: TanStack Query for Dashboard Data

The DashboardView should use `useQuery` with `staleTime: 0` (unlike settings which use `Infinity`) so the dashboard refreshes when the user returns to it. The query key should include the date string.

```typescript
// src/renderer/dashboard/DashboardView.tsx
import { useQuery } from '@tanstack/react-query'

const todayStr = getTodayDateStr() // same pure-JS helper as habits-store

const { data, isError } = useQuery({
  queryKey: ['dashboard', todayStr],
  queryFn: () => window.api.dashboard.getToday(todayStr),
  staleTime: 0,         // always re-fetch when view mounts
})
```

Note: `staleTime: 0` means data refetches on component mount when the dashboard is re-visited. This is correct behavior — the user wants fresh data when they return to the dashboard from a module.

### Pattern 4: CommandPalette Component

Mount CommandPalette at App level, parallel to KeyboardShortcutOverlay:

```typescript
// App.tsx — add state and mounting
const [showCommandPalette, setShowCommandPalette] = useState(false)

// In JSX, alongside KeyboardShortcutOverlay:
<CommandPalette
  isOpen={showCommandPalette}
  onClose={() => setShowCommandPalette(false)}
  onAction={(action) => {
    setShowCommandPalette(false)
    // action: 'add-task' | 'log-expense' | 'check-habit'
    switch (action) {
      case 'add-task':
        setActiveModule('planner')
        setNewItemTrigger(n => n + 1)
        break
      case 'log-expense':
        setActiveModule('expenses')
        setNewItemTrigger(n => n + 1)
        break
      case 'check-habit':
        setActiveModule('habits')
        setNewItemTrigger(n => n + 1)
        break
    }
  }}
/>
```

Pass `onCommandPalette` to KeyboardRouter to handle Ctrl+K:
```typescript
// KeyboardRouter.tsx — add to handleKeyDown
if (e.ctrlKey && !e.altKey && !e.metaKey && e.key === 'k') {
  e.preventDefault()
  onCommandPalette()   // new prop
  return
}
```

This Ctrl+K handler should be OUTSIDE the `isEditing` guard — Ctrl+K must work even when a text input has focus (same pattern as Alt+1-4 module switching).

### Pattern 5: CommandPalette Focus Management

The palette needs auto-focus on the search input when it opens, and keyboard navigation (ArrowUp/ArrowDown/Enter/Escape) within the palette itself. Use `useRef` + `useEffect` pattern:

```typescript
const inputRef = useRef<HTMLInputElement>(null)

useEffect(() => {
  if (isOpen) {
    // Small delay ensures the element is visible before focus
    setTimeout(() => inputRef.current?.focus(), 10)
  }
}, [isOpen])
```

Keyboard navigation within the palette (up/down arrow, Enter) should be handled with a `keydown` listener on the palette container, NOT on the global document — this prevents conflicts with KeyboardRouter.

Escape in the palette: the existing KeyboardRouter Escape handler calls `onEscape()` which closes the shortcut overlay first. The CommandPalette needs its own `onKeyDown` to handle Escape before it bubbles to the document.

### Pattern 6: Focus Ring Implementation

The project uses `user-select: none` globally and `outline: none` on sidebar buttons. For KBD-01, interactive elements in the dashboard need explicit `:focus-visible` rings. Since the project uses inline styles (no CSS classes), apply focus ring via a `onFocus`/`onBlur` state or a CSS class added to globals.css:

```css
/* globals.css addition */
.focus-ring:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}
```

Then apply `className="focus-ring"` to dashboard cards and command palette items. This is cleaner than inline `onFocus` state for multiple elements.

Alternative approach (inline, no CSS class): use `tabIndex={0}` + `onFocus` state + inline `outline` style. Both work; the CSS class approach is DRY.

### Pattern 7: Overdue Task Query

The tasks card needs an overdue count. PlannerRepository does not currently have a method for this. The dashboard IPC handler adds one directly via SQL — no need to modify PlannerRepository:

```typescript
// Inside dashboard.ts handler
const overdueCount = (db
  .prepare('SELECT COUNT(*) as n FROM tasks WHERE date < ? AND completed = 0')
  .get(date) as { n: number }).n
```

The `date` index `idx_tasks_date` (created in migration v1) makes this query fast.

### Pattern 8: Spending Aggregation

Category amounts for the spending card require a JOIN:

```sql
SELECT c.name, c.color, SUM(e.amount) as total
FROM expenses e
JOIN categories c ON e.category_id = c.id
WHERE e.date = ?
GROUP BY e.category_id
ORDER BY total DESC
LIMIT 3
```

The `idx_expenses_date` index from migration v1 covers the `WHERE e.date = ?` filter.

### Pattern 9: Day-of-Week Filtering for Habits

The `daysOfWeek` field is a 7-character string like `"1111111"` (all days) or `"0111110"` (Mon-Fri). Position 0 = Sunday, position 6 = Saturday (matches JS `Date.getDay()` convention). To filter active habits scheduled for today:

```typescript
const dayIndex = new Date(date + 'T12:00:00').getDay() // avoid timezone midnight edge
const activeHabits = habitRepo.listActive()
const scheduledToday = activeHabits.filter(h => h.daysOfWeek[dayIndex] === '1')
```

Use `T12:00:00` (noon) when constructing the Date to prevent the date string from shifting to the previous day due to local timezone offset — same concern noted in STATE.md "Streak date logic needs careful timezone handling."

### Anti-Patterns to Avoid

- **Calling module IPC handlers from DashboardView:** Do NOT call `window.api.habits.getToday()` + `window.api.planner.listForDate()` + `window.api.expenses.listExpenses()` in parallel from the renderer. This fires three IPC round-trips. Use a single `dashboard:getToday` IPC handler that aggregates in the main process with direct repository calls.
- **staleTime: Infinity for dashboard:** Settings are Infinity because they don't change from external sources. Dashboard data changes every time the user interacts with a module. Use `staleTime: 0`.
- **Ctrl+K inside the isEditing guard:** Ctrl+K must work in inputs. The current KeyboardRouter correctly gates some shortcuts on `!isEditing` but module switching (Alt+1-4) and Escape bypass this. Ctrl+K belongs in the same "always active" group.
- **Managing command palette arrow-key selection in KeyboardRouter:** Arrow keys inside the palette should be handled inside the palette component, not in the global KeyboardRouter. Global handler would need to know when the palette is open and suppress its normal ArrowLeft/ArrowRight planner navigation.
- **tabIndex on sidebar buttons:** D-13 is explicit — sidebar is NOT keyboard-focusable. The existing `outline: none` on sidebar buttons is correct and must not be changed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date formatting ("Friday, March 21") | Custom formatter | Pure JS: `new Date().toLocaleDateString('en-US', {weekday:'long',month:'long',day:'numeric'})` | Browser Intl API handles locale, no library needed |
| SQL aggregation for today's data | Multiple IPC calls + frontend join | Single `dashboard:getToday` handler with SQL SUM + GROUP BY | Single IPC round-trip, correct data boundary |
| Focus trap in command palette | Custom tab trap | `tabIndex` + keyboard event handling within palette container | Palette has very few focusable elements; full trap library is overkill |
| Command palette search | Fuzzy search library | Case-insensitive substring: `label.toLowerCase().includes(query.toLowerCase())` | Three static items, no library needed |

**Key insight:** With only 3 command palette items, all filtering logic is trivially inline. This is not a general-purpose command palette — it is a three-item navigation shortcut with a filter.

---

## Common Pitfalls

### Pitfall 1: Timezone Shift in Date Strings

**What goes wrong:** `new Date('2026-03-21')` in a timezone behind UTC (e.g. UTC-5) returns March 20, because the ISO date string is interpreted as UTC midnight.
**Why it happens:** ISO date strings without time component are parsed as UTC, not local time.
**How to avoid:** Always append `T12:00:00` (noon, no timezone) when constructing a Date from a `YYYY-MM-DD` string. The project already avoids date-fns (STATE.md decision) and uses pure JS — apply the same noon trick used in the streak calculation pattern.
**Warning signs:** Tests pass in UTC CI but fail for users in UTC-N timezones. Day-of-week filtering shows wrong habits.

### Pitfall 2: staleTime: 0 Causing Flash on Module Return

**What goes wrong:** Returning to the dashboard triggers a loading state while data refetches, causing a blank card flash.
**Why it happens:** `staleTime: 0` marks data stale immediately; on mount, React Query re-fetches before rendering.
**How to avoid:** Use `placeholderData: keepPreviousData` (TanStack Query v5 option) so the previous data renders while the new fetch completes. For a local SQLite app, the re-fetch completes in < 5ms so the flash is imperceptible, but `keepPreviousData` is still the correct pattern.

### Pitfall 3: Ctrl+K Conflicting with Browser DevTools

**What goes wrong:** In Electron dev mode, Ctrl+K may conflict with DevTools shortcuts depending on configuration.
**Why it happens:** Electron DevTools are Chromium DevTools and may capture Ctrl+K.
**How to avoid:** In production this is not an issue (DevTools disabled). The existing `e.preventDefault()` call in KeyboardRouter prevents the default browser action. This is already the pattern for Alt+1-4 and other shortcuts.

### Pitfall 4: CommandPalette Escape Not Closing

**What goes wrong:** Pressing Escape when the command palette is open navigates to dashboard (the current Escape behavior) instead of closing the palette.
**Why it happens:** KeyboardRouter's `handleEscape` runs `onEscape()` which closes shortcut overlay first, then navigates to dashboard. The palette has no special case.
**How to avoid:** The App.tsx `handleEscape` callback must check `showCommandPalette` first — same pattern as `showShortcuts`. Close the palette before navigating to dashboard:
```typescript
const handleEscape = useCallback(() => {
  if (showCommandPalette) { setShowCommandPalette(false); return }
  if (showShortcuts) { setShowShortcuts(false); return }
  if (activeModule !== 'dashboard') { setActiveModule('dashboard') }
}, [showCommandPalette, showShortcuts, activeModule])
```

### Pitfall 5: Missing --color-warning Token

**What goes wrong:** The overdue badge uses `--color-warning` (amber-400, `#f59e0b`) but this token does not yet exist in globals.css.
**Why it happens:** The token is specified in the UI-SPEC but was not present in the original design system (only `--color-destructive` exists).
**How to avoid:** Add `--color-warning: #f59e0b;` to the `@theme` block in globals.css in plan 03-01 (before any component references it). Verify against globals.css — only `--color-destructive` exists currently.

### Pitfall 6: newItemTrigger Counter Fires on Wrong Module

**What goes wrong:** CommandPalette selects "Add task", navigates to planner, increments `newItemTrigger` — but HabitsView also listens to `newItemTrigger` and opens the habit form.
**Why it happens:** The current `newItemTrigger` is a single shared counter consumed by whichever module renders. If the navigation (`setActiveModule`) and the trigger increment happen in the same render cycle, the old module's useEffect may fire before the new module mounts.
**How to avoid:** The `setActiveModule` state change unmounts the old module component before the new one mounts. Since both are in the same `useCallback`, `setActiveModule` runs first (React batches state updates), then `setNewItemTrigger`. The new module mounts with the incremented counter and fires its `useEffect`. This is the same pattern as the "N" key — it already works correctly. Confirm the CommandPalette action handler calls `setActiveModule` then `setNewItemTrigger` in that order within the same callback.

---

## Code Examples

Verified from codebase:

### Existing getTodayDateStr helper (habits-store.ts — replicate, don't import)
```typescript
function getTodayDateStr(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
```
Each module has its own copy of this helper. DashboardView should also have its own copy (no cross-module import of store utilities).

### IPC handler registration pattern (from ipc/index.ts)
```typescript
// src/main/ipc/index.ts
import { registerDashboardHandlers } from './dashboard'
export function registerAllHandlers(): void {
  registerSettingsHandlers()
  registerHabitsHandlers()
  registerPlannerHandlers()
  registerExpensesHandlers()
  registerDashboardHandlers()  // add last
}
```

### Click-outside pattern for overlays (from KeyboardShortcutOverlay.tsx)
```typescript
useEffect(() => {
  if (!isOpen) return
  function handleClick(e: MouseEvent) {
    if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
      onClose()
    }
  }
  // setTimeout(0) avoids closing immediately from the triggering keypress
  const timer = setTimeout(() => {
    document.addEventListener('mousedown', handleClick)
  }, 0)
  return () => {
    clearTimeout(timer)
    document.removeEventListener('mousedown', handleClick)
  }
}, [isOpen, onClose])
```
CommandPalette must use the same setTimeout(0) pattern — Ctrl+K triggers open, and without the delay the click event from the keypress would immediately close it.

### Existing newItemTrigger counter pattern (from App.tsx)
```typescript
const [newItemTrigger, setNewItemTrigger] = useState(0)
const handleNewItem = useCallback(() => {
  setNewItemTrigger((n) => n + 1)
}, [])
// Passed to HabitsView and ExpensesView as prop
// HabitsView useEffect: opens form when newItemTrigger changes
```

### Overlay style pattern (from KeyboardShortcutOverlay.tsx)
```typescript
// Full-screen backdrop
<div style={{
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  animation: 'fadeIn var(--duration-normal) ease-out',
}}>
```
CommandPalette uses the same backdrop pattern but positions the inner container at `top: 20%` rather than center (per UI-SPEC).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run tests/dashboard-ipc.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SHELL-01 | `dashboard:getToday` returns habits/tasks/spending summary for a given date | unit | `npx vitest run tests/dashboard-ipc.test.ts` | ❌ Wave 0 |
| SHELL-01 | Overdue count correctly counts tasks before today with completed=0 | unit | `npx vitest run tests/dashboard-ipc.test.ts` | ❌ Wave 0 |
| SHELL-01 | Empty state: returns 0 counts when no data exists for today | unit | `npx vitest run tests/dashboard-ipc.test.ts` | ❌ Wave 0 |
| SHELL-01 | Spending aggregation: sums amounts and groups by category | unit | `npx vitest run tests/dashboard-ipc.test.ts` | ❌ Wave 0 |
| SHELL-02 | Sidebar active indicator reflects activeModule (visual — manual) | manual | N/A | N/A |
| KBD-01 | Tab order reaches dashboard cards (manual — Electron renderer) | manual | N/A | N/A |
| KBD-02 | Ctrl+K opens palette; selecting action navigates and triggers add flow (manual) | manual | N/A | N/A |
| KBD-03 | `?` overlay shows all three sections with correct shortcuts (manual) | manual | N/A | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/dashboard-ipc.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/dashboard-ipc.test.ts` — covers SHELL-01 data aggregation, overdue count, empty state, spending grouping. Follows pattern of `tests/planner-repository.test.ts`: in-memory SQLite, `@vitest-environment node` directive, schema setup inline.

*(Existing test infrastructure — vitest.config.ts, tests/setup.ts — covers all other needs. No new framework install required.)*

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Command palette with cmdk library | Custom inline implementation (3 items, substring filter) | N/A for this project | No dependency needed; inline is simpler |
| Global focus trap for modal dialogs | Component-level keydown handler + click-outside | Phase 1 pattern | Consistent with existing overlay pattern |

**Confirmed current patterns in this codebase:**
- Overlay close: click-outside with setTimeout(0) guard (confirmed in KeyboardShortcutOverlay.tsx)
- Counter trigger for module add actions: newItemTrigger in App.tsx (confirmed, used in HabitsView and ExpensesView)
- IPC handler files: one file per module in src/main/ipc/, registered in index.ts

---

## Open Questions

1. **HabitsView `newItemTrigger` prop vs PlannerView**
   - What we know: HabitsView and ExpensesView both accept `newItemTrigger` prop. PlannerView does NOT currently accept it (based on App.tsx line 74: `<PlannerView />` — no props).
   - What's unclear: Does PlannerView already wire up the "N" key trigger, or does it need `newItemTrigger` added for the CommandPalette "Add task" action?
   - Recommendation: Read PlannerView source before implementing Plan 03. If PlannerView doesn't accept `newItemTrigger`, the CommandPalette "Add task" action either needs to add the prop to PlannerView, or rely on the user pressing "N" after navigating. Given D-11 says "focuses the add input", the prop must be added to PlannerView.

2. **Dashboard query invalidation when returning from modules**
   - What we know: `staleTime: 0` + `keepPreviousData` handles re-fetch on mount correctly.
   - What's unclear: Should the dashboard also invalidate when the user checks off a habit from within the Habits module (so the count is fresh when they return)?
   - Recommendation: No proactive invalidation needed. The dashboard fetches fresh data every time it mounts (staleTime: 0). Since DashboardView unmounts when another module is active (conditional rendering in App.tsx), returning to dashboard always triggers a fresh fetch. This is sufficient.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase read: `src/main/ipc/habits.ts`, `planner.ts`, `expenses.ts` — IPC handler registration pattern confirmed
- Direct codebase read: `src/main/repositories/HabitRepository.ts`, `PlannerRepository.ts`, `ExpenseRepository.ts` — available repository methods confirmed
- Direct codebase read: `src/main/db/migrations.ts` — schema confirmed, indexes confirmed
- Direct codebase read: `src/renderer/App.tsx` — dashboard placeholder location (lines 84-104), newItemTrigger pattern confirmed
- Direct codebase read: `src/renderer/shell/KeyboardRouter.tsx` — input guard pattern, existing shortcut structure confirmed
- Direct codebase read: `src/renderer/shell/KeyboardShortcutOverlay.tsx` — overlay close pattern with setTimeout(0) confirmed
- Direct codebase read: `src/renderer/shared/styles/globals.css` — --color-warning NOT present confirmed; all other tokens confirmed
- Direct codebase read: `vitest.config.ts`, `tests/setup.ts`, `tests/planner-repository.test.ts` — test infrastructure and patterns confirmed

### Secondary (MEDIUM confidence)
- `03-UI-SPEC.md` (approved 2026-03-21) — component dimensions, color specs, copywriting contract, animation tokens
- `03-CONTEXT.md` — all locked decisions D-01 through D-16

### Tertiary (LOW confidence)
- None — all findings verified from codebase or approved upstream artifacts

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — entire stack confirmed from package.json and existing handlers; no new packages
- Architecture: HIGH — IPC pattern, overlay pattern, newItemTrigger pattern all confirmed from existing code
- Pitfalls: HIGH — timezone pitfall confirmed from STATE.md decision log; Escape hierarchy confirmed from KeyboardRouter.tsx; missing token confirmed from globals.css

**Research date:** 2026-03-21
**Valid until:** 2026-04-20 (stable stack, 30 days)
