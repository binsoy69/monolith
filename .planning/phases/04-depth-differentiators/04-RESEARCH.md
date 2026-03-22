# Phase 4: Depth + Differentiators - Research

**Researched:** 2026-03-22
**Domain:** Electron + React desktop app - habit depth, planner carry-forward, expense analytics
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md and UI-SPEC.md)

### Locked Decisions

**Habits**
- D-01: Habit depth expands inline inside the card list. No separate detail panel.
- D-02: Heatmap uses a single accent-color intensity scale.
- D-03: Heatmap shows the last 90 days so it fits cleanly inside the expanded card.
- D-04: Count-based habits display an inline fraction such as `3/8`.
- D-05: Count-based habits use the same completed visual treatment as boolean habits once target is reached.
- D-13: Habit reorder uses the existing dnd-kit drag-handle pattern from planner rows.

**Planner**
- D-06: Carry-forward runs on app open.
- D-07: Carried tasks stay in today's list, appear at the top, and use a subtle amber left border.
- D-08: Tasks support P1 / P2 / P3 priority levels.
- D-09: Overdue tasks have a visible indicator that is noticeable but not alarming.

**Expenses**
- D-10: Category breakdown is a donut chart with total spending in the center.
- D-11: Charts live inline in `ExpensesView` above the expense list, not in a separate tab.
- D-12: Trend line supports 3 / 6 / 12 month periods and defaults to 6 months.

### Resolved Planning Assumptions

- A-01: D-01 (expand-in-place) and D-04 (count increment) conflict if the entire card only does one thing. The plan resolves this by making the row body expand/collapse while the leading control handles boolean toggle or count increment/reset.
- A-02: `ROADMAP.md` still says "last year" for the habit heatmap, but the locked phase context narrows the UI to a 90-day in-card heatmap. Plans implement the 90-day heatmap plus explicit 7-day and 30-day history counts.
- A-03: Expense analytics stay tied to the current calendar month and the selected 3 / 6 / 12 month trend window. They do not change when the user filters the expense list below.

### Deferred Ideas (explicitly out of scope)

- Desktop reminders for habits remain Phase 5 work (`HAB-09`).
- Expense tags, budgets, and export remain Phase 5 work.
- Any separate analytics dashboard or drill-down pages remain out of scope for Phase 4.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HAB-04 | View completion history for last 7 / 30 days | Expanded habit panel with derived 7-day / 30-day completed-day counts from history rows |
| HAB-06 | Reorder habits manually | Reuse dnd-kit sortable pattern already proven in `TaskList.tsx` |
| HAB-07 | View a GitHub-style completion heatmap | New `HabitHeatmap.tsx` rendering a 13 x 7 SVG grid for 90 days |
| HAB-08 | Track count-based habits with numerical targets | Reuse `habit_completions.value` and add `kind` + `target_count` to habits |
| PLAN-06 | Set task priority levels | Surface existing `tasks.priority` column in types, repo, store, and row UI |
| PLAN-07 | Automatically carry unfinished tasks forward to today | Add `carried_from_date` and a transactional `carryForwardToDate(today)` repository method |
| PLAN-08 | Show overdue visual indicator | Overdue derives from `carried_from_date` / original date, not from current `date` once tasks are moved |
| EXP-04 | Show monthly spending totals | New analytics IPC returns current-month total in cents |
| EXP-05 | Show spending breakdown by category | Analytics query groups the current month by category and feeds a donut chart |
| EXP-10 | Show 6-12 month spending trends | Analytics query groups by `YYYY-MM`, zero-fills missing months, feeds a 3 / 6 / 12 month trend chart |
</phase_requirements>

---

## Summary

Phase 4 should be planned as three sequential waves, not parallel module plans. All three areas touch shared bridge files (`src/shared/ipc-types.ts`, `src/preload/index.ts`) and two of the three also modify cross-cutting aggregation logic in `src/main/ipc/dashboard.ts`. Sequential waves reduce merge risk and make later plans build on stable shared contracts instead of forcing multiple executors into the same files.

The highest-leverage discovery is that the current schema already contains most of the raw data needed:

- `habit_completions.value` already exists and can store count-based progress without a new table.
- `tasks.priority` already exists in SQLite, but the shared TypeScript model ignores it today.
- expense analytics need no schema change at all; they only need new grouped queries and a renderer contract.

The only new persistence field Phase 4 truly needs is `tasks.carried_from_date`, because once an overdue task is moved to today the original due date is otherwise lost. That column is also the cleanest way to keep overdue indicators and dashboard counts correct after carry-forward happens.

**Recommended wave structure**

1. `04-01` Habit depth and shared habit contracts.
2. `04-02` Planner carry-forward and task priority, including dashboard task aggregation update.
3. `04-03` Expense analytics and Recharts-based charts.

---

## Standard Stack

### Existing stack already in the repo

| Library | Current Use | Phase 4 Role |
|---------|-------------|--------------|
| `better-sqlite3` | All repositories and IPC queries | Count-based habit values, carry-forward transaction, grouped expense analytics |
| `zustand` | Module-local UI / data stores | Habit history cache, planner priority updates, expense analytics state |
| `@dnd-kit/core`, `@dnd-kit/sortable` | Planner task reorder | Habit reorder with the same handle-only interaction model |
| `@tanstack/react-query` | Dashboard view | Not required for Phase 4 modules; current module stores already use Zustand successfully |
| `lucide-react` | Drag handles, notes icons, shell icons | Habit drag handle and optional chart affordance icons |

### New dependency required

| Package | Why it is needed | Recommendation |
|---------|------------------|----------------|
| `recharts` | Donut and trend charts in `ExpensesView` | Install during `04-03` and theme every visible chart primitive so no default styling leaks through |

### Keep existing project constraints

- Continue pure JS date arithmetic. Do not re-introduce `date-fns`; `STATE.md` documents the v4 ESM test breakage already hit in Phase 2.
- Continue inline React styles backed by CSS custom properties.
- Continue optimistic updates with rollback toast behavior in module stores.

---

## Architecture Patterns

### Pattern 1: Reuse `habit_completions.value` for count habits

Current schema:

- `habits` already has stable identity, schedule bitmask, archived flag, and position.
- `habit_completions` already stores `value INTEGER`.

Recommended change:

- Add `kind TEXT NOT NULL DEFAULT 'boolean'` to `habits`.
- Add `target_count INTEGER` to `habits`.
- Keep using `habit_completions.value`:
  - boolean habit: `0 / missing` means incomplete, `1` means complete
  - count habit: `0..targetCount` means partial progress, `>= targetCount` means complete

This avoids a second count-history table and keeps all heatmap/history math in one place.

### Pattern 2: Separate "row action" from "progress action" in habits

The existing `HabitCard.tsx` uses whole-card click to toggle completion. Phase 4 needs both expand/collapse and count increments, so the card needs two interaction zones:

- leading control:
  - boolean habit -> existing checkbox toggle
  - count habit -> compact fraction pill button (`3/8`) that increments or resets progress
- row body -> expand / collapse inline details

This preserves dense layout, keeps expansion discoverable, and avoids making count habits impossible to inspect.

### Pattern 3: Reorder only the active incomplete scheduled habit bucket

`HabitsView.tsx` already buckets habits by:

1. scheduled and incomplete
2. unscheduled
3. completed

Keep that visual model. Only wrap the first bucket in `SortableContext`, exactly like `TaskList.tsx` only wraps incomplete tasks. Persist the resulting order through a `habits:reorder` IPC that writes `position = 0..n`.

This keeps manual order meaningful while still preserving the current "today first, done later" reading order.

### Pattern 4: Carry-forward belongs in the planner repository, not App state

Do not implement carry-forward as a renderer-only effect that mutates tasks after views have already fetched data. That introduces a race against `DashboardView` and `PlannerView`.

Recommended implementation:

- add `PlannerRepository.carryForwardToDate(targetDate: string)`
- inside a single transaction:
  - select all incomplete tasks where `date < targetDate`
  - preserve the earliest missed date via `carried_from_date = COALESCE(carried_from_date, date)`
  - move them to `targetDate`
  - assign them positions `0..n-1`
  - shift existing incomplete tasks already on `targetDate` down by `n`
- call the method before reading today's tasks in:
  - `planner:listForDate(today)`
  - `dashboard:getToday(today)`

That guarantees the default dashboard and the planner both see the same carried-forward task set on app launch.

### Pattern 5: Overdue must derive from original due date, not current row date

Once carry-forward runs, the current `tasks.date` becomes today. Querying `WHERE date < today` stops working for overdue indicators and dashboard counts.

Use:

- `carried_from_date` for carried tasks
- `COALESCE(carried_from_date, date) < today` for overdue checks

This keeps both planner UI and dashboard overdue count correct after tasks are moved.

### Pattern 6: Use the current flat context menu for priority actions

`ContextMenu.tsx` only supports flat items today. Extending it to nested menus would add unnecessary shared complexity.

Recommended UI:

- right-click task row shows:
  - Edit
  - Move to date
  - Set P1 priority
  - Set P2 priority
  - Set P3 priority
  - Clear priority
  - Delete

This fits the current component and keeps priority setting low-friction.

### Pattern 7: Expense analytics should be a single IPC contract

Do not build charts by fetching all expenses into the renderer and aggregating there. The analytics panel has its own stable requirements and should not depend on the list filter state.

Recommended API:

```ts
expenses.getAnalytics({
  month: '2026-03',
  trendMonths: 3 | 6 | 12,
})
```

Return:

- `monthLabel`
- `monthTotal`
- `categoryBreakdown[]`
- `trend[]`

Internally:

- current month total: `SUM(amount)` for the selected month range
- category breakdown: `GROUP BY category_id`
- trend: `GROUP BY substr(date, 1, 7)` and zero-fill missing months in JS

### Pattern 8: Keep the expense chart section independent from filters

`ExpenseList.tsx` already filters list rows by date/category. Charts should remain a stable "summary layer" above that list. If analytics followed list filters, the monthly total and trend line would change in confusing ways whenever the user narrowed the table.

The section should always summarize:

- the current calendar month for total + donut
- the chosen trailing 3 / 6 / 12 month window for the trend line

### Pattern 9: Use SVG heatmap for habits, Recharts only for expense charts

The habit heatmap is a dense fixed grid, not a general chart. A hand-authored SVG is smaller, easier to theme, and aligns better with the app's handcrafted UI direction.

Use Recharts only where it adds real value:

- donut chart
- trend / area chart

Do not introduce Recharts for the heatmap.

---

## Anti-Patterns

- Do not store a separate "count habit history" table. The existing `habit_completions.value` field already solves the persistence problem.
- Do not run carry-forward from `App.tsx` after initial render. The dashboard can fetch before the move happens.
- Do not keep using `date < today` to define overdue once tasks are moved forward.
- Do not make charts depend on the expense list's active filters.
- Do not let multiple phase-4 plans edit `src/shared/ipc-types.ts` and `src/preload/index.ts` in the same wave.
- Do not ship default Recharts tooltips, axes, or legend dots. The UI-SPEC explicitly forbids visible library defaults.

---

## Do Not Hand-Roll

| Problem | Avoid | Use Instead | Why |
|---------|-------|-------------|-----|
| Habit heatmap layout | Generic chart library grid | Inline SVG with 10px cells and 2px gaps | Fixed-size dense grid is simpler and easier to theme |
| Carry-forward orchestration | Renderer timers or startup flags | Repository transaction invoked from "today" queries | Eliminates dashboard/planner race conditions |
| Expense currency formatting | New inline formatters | Existing `src/shared/format.ts` `formatPeso()` | Keeps all money strings consistent |
| Priority menu UX | Nested menu framework | Current flat context menu with explicit priority items | Reuses a proven shared component and avoids new complexity |

---

## Common Pitfalls

### Pitfall 1: Count habits break streak math if partial days count as complete

`calculateStreaks()` currently accepts only completion dates. Count habits need a filtered date list where `value >= targetCount`, not merely `value > 0`. Partial progress should display in the UI but should not advance the streak.

### Pitfall 2: Reorder conflicts with "auto sort" if position is ignored after reload

`HabitRepository.listActive()` already sorts by `position ASC, created_at ASC`, but the renderer currently ignores persistent ordering in favor of bucket-only sorting. Phase 4 must sort each bucket by the stored order so a drag operation survives reload.

### Pitfall 3: Dashboard overdue count will silently regress after carry-forward

Today `dashboard.ts` uses `WHERE date < ? AND completed = 0`. Once carry-forward moves overdue tasks to today, that query returns zero even though the user still expects overdue state. Update the dashboard tests when planner carry-forward lands.

### Pitfall 4: Manual reschedule should clear overdue state

If a user explicitly moves a task to a new date via the existing "Move to date" flow, that is a deliberate reschedule, not an overdue carry. `PlannerRepository.update(id, { date })` should clear `carried_from_date` when the date change is user-driven.

### Pitfall 5: Expense trend charts need zero-filled months

Grouped SQL only returns months that contain expenses. Without zero-fill, a 6-month line chart can render 2 or 3 disconnected points and fail the requirement for a stable 6-12 month trend.

### Pitfall 6: Recharts defaults violate the product aesthetic immediately

Default tooltips, legend icons, axis text, and animation timings all look out of place against the dark dense UI. The phase plan should treat chart theming as a first-class deliverable, not optional polish.

---

## Code Examples

Verified from the current codebase:

### Existing task reorder pattern

From `src/renderer/planner/TaskList.tsx`:

```ts
const incompleteTasks = tasks
  .filter((t) => !t.completed)
  .sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt))
```

This is the exact pattern habits should mirror for the sortable bucket.

### Existing dashboard aggregation entry point

From `src/main/ipc/dashboard.ts`:

```ts
export function getDashboardData(db: Database.Database, date: string): DashboardData
```

Planner carry-forward needs to hook into this function before task aggregation runs for today's dashboard.

### Existing money formatting helper

From `src/shared/format.ts`:

```ts
export function formatPeso(cents: number): string
```

Reuse it for donut center totals, trend tooltip values, and monthly summary text.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run tests/habits-depth-ipc.test.ts tests/planner-depth-repository.test.ts tests/expense-analytics-ipc.test.ts` |
| Full suite command | `npx vitest run` |
| Estimated runtime | ~12 seconds once Phase 4 tests exist |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Planned Command | File Exists? |
|--------|----------|-----------|-----------------|-------------|
| HAB-04 | 7-day / 30-day counts and 90-day history payload are returned correctly | unit | `npx vitest run tests/habits-depth-ipc.test.ts` | No - Wave 0 |
| HAB-06 | Habit reorder persists `position` order | unit | `npx vitest run tests/habits-depth-ipc.test.ts` | No - Wave 0 |
| HAB-07 | Heatmap payload spans exactly 90 days and marks completed days correctly | unit | `npx vitest run tests/habits-depth-ipc.test.ts` | No - Wave 0 |
| HAB-08 | Count habits only complete at target and rollback correctly | unit | `npx vitest run tests/habits-depth-ipc.test.ts` | No - Wave 0 |
| PLAN-06 | Task priority persists and round-trips to renderer | unit | `npx vitest run tests/planner-depth-repository.test.ts` | No - Wave 0 |
| PLAN-07 | Carry-forward moves incomplete tasks to today and puts them first | unit | `npx vitest run tests/planner-depth-repository.test.ts` | No - Wave 0 |
| PLAN-08 | Dashboard and planner overdue state uses `carried_from_date` correctly | unit | `npx vitest run tests/planner-depth-repository.test.ts tests/dashboard-ipc.test.ts` | Partly - dashboard file exists |
| EXP-04 | Current-month total is correct in cents | unit | `npx vitest run tests/expense-analytics-ipc.test.ts` | No - Wave 0 |
| EXP-05 | Category breakdown sorts descending and percentages sum correctly | unit | `npx vitest run tests/expense-analytics-ipc.test.ts` | No - Wave 0 |
| EXP-10 | Trend output zero-fills 3 / 6 / 12 month windows | unit | `npx vitest run tests/expense-analytics-ipc.test.ts` | No - Wave 0 |

### Wave 0 Gaps

- `tests/habits-depth-ipc.test.ts`
- `tests/planner-depth-repository.test.ts`
- `tests/expense-analytics-ipc.test.ts`

No new test framework install is needed; Phase 4 only needs new targeted files.

---

## Sources

### Primary

- `src/renderer/habits/HabitsView.tsx`
- `src/renderer/habits/HabitCard.tsx`
- `src/renderer/habits/HabitForm.tsx`
- `src/renderer/planner/PlannerView.tsx`
- `src/renderer/planner/TaskList.tsx`
- `src/renderer/planner/TaskRow.tsx`
- `src/renderer/expenses/ExpensesView.tsx`
- `src/renderer/expenses/ExpenseList.tsx`
- `src/main/ipc/habits.ts`
- `src/main/ipc/planner.ts`
- `src/main/ipc/expenses.ts`
- `src/main/ipc/dashboard.ts`
- `src/main/repositories/HabitRepository.ts`
- `src/main/repositories/PlannerRepository.ts`
- `src/main/repositories/ExpenseRepository.ts`
- `src/main/utils/streaks.ts`
- `src/shared/domain-types.ts`
- `src/shared/ipc-types.ts`
- `src/shared/format.ts`
- `src/preload/index.ts`
- `src/main/db/migrations.ts`
- `tests/dashboard-ipc.test.ts`
- `tests/planner-repository.test.ts`

### Upstream planning artifacts

- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/phases/04-depth-differentiators/04-CONTEXT.md`
- `.planning/phases/04-depth-differentiators/04-UI-SPEC.md`
- `.impeccable.md`

---

## Metadata

- Habit data-model recommendation: HIGH confidence
- Planner carry-forward recommendation: HIGH confidence
- Expense analytics / charting recommendation: HIGH confidence
- Wave structure recommendation: HIGH confidence

Research date: 2026-03-22
Valid until: 2026-04-21
