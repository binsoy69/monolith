---
phase: 03-dashboard-navigation
plan: 01
subsystem: dashboard
tags: [ipc, dashboard, ui, sqlite, tanstack-query, tdd]
dependency_graph:
  requires: [HabitRepository, PlannerRepository, ExpenseRepository, ipc-types, globals.css]
  provides: [DashboardData type, DashboardAPI type, dashboard:getToday IPC, getDashboardData(), DashboardView, HabitsCard, TasksCard, SpendingCard]
  affects: [App.tsx, preload/index.ts, ipc/index.ts]
tech_stack:
  added: []
  patterns: [TDD red-green, useQuery with keepPreviousData, pure aggregation function tested directly, inline card components, useState hover state]
key_files:
  created:
    - src/main/ipc/dashboard.ts
    - src/renderer/dashboard/DashboardView.tsx
    - src/renderer/dashboard/HabitsCard.tsx
    - src/renderer/dashboard/TasksCard.tsx
    - src/renderer/dashboard/SpendingCard.tsx
    - tests/dashboard-ipc.test.ts
  modified:
    - src/shared/ipc-types.ts
    - src/main/ipc/index.ts
    - src/preload/index.ts
    - src/renderer/shared/styles/globals.css
    - src/renderer/App.tsx
decisions:
  - getDashboardData extracted as pure function for direct unit testing — avoids IPC test complexity while keeping handler thin
  - daysOfWeek bitmask filtering done in JS (not SQL) — consistent with existing habits pattern, avoids SQLite string indexing edge cases
  - amounts stored as integers (centavos) — formatPeso() divides by 100 in SpendingCard
  - npm rebuild better-sqlite3 required — Node.js version mismatch between system node (v20) and what the module was compiled for
metrics:
  duration_minutes: 6
  completed_date: "2026-03-21"
  tasks_completed: 2
  files_changed: 11
---

# Phase 3 Plan 1: Dashboard IPC and Three-Card View Summary

**One-liner:** `dashboard:getToday` IPC aggregates habits/tasks/spending from three SQLite repositories into a single call, rendered by DashboardView with clickable HabitsCard (progress bar + streaks), TasksCard (task list + overdue badge), and SpendingCard (peso total + category breakdown).

## What Was Built

### Task 1: Dashboard IPC types, handler, preload bridge, and unit tests

Added `DashboardData` and `DashboardAPI` types to `src/shared/ipc-types.ts`. Created `src/main/ipc/dashboard.ts` with an exported `getDashboardData(db, date)` pure aggregation function that:
- Filters active habits by `daysOfWeek` bitmask for the given date's day-of-week
- Counts completions from `habit_completions` table
- Builds streak highlights (top 2 non-zero streaks) using `calculateStreaks()`
- Queries today's incomplete tasks (up to 5 for display, full count for `totalIncomplete`)
- Counts overdue tasks via `SELECT COUNT(*) WHERE date < ? AND completed = 0`
- Aggregates spending with JOIN to categories, returns top 3 by amount DESC

Registered handler in `ipc/index.ts`, added preload bridge, added `--color-warning: #f59e0b` and `.focus-ring:focus-visible` to `globals.css`.

5 unit tests written TDD (RED then GREEN): data aggregation, overdue count, empty state, spending grouping, daysOfWeek filtering.

**Deviation:** `npm rebuild better-sqlite3` was needed (Rule 3 auto-fix) — Node.js version mismatch between system node v20 and the compiled module. Fixed inline before running tests.

**Deviation (test fix):** Test SQL had 3 `?` placeholders for habits INSERT but was passing 5 values. Fixed by removing the extra trailing `0` argument in Test 1 and Test 5.

### Task 2: DashboardView UI with three summary cards

Created `src/renderer/dashboard/DashboardView.tsx` using `useQuery` with `staleTime: 0` and `keepPreviousData`. Date header formatted as "Friday, March 21" via `toLocaleDateString('en-US', {...})`. Error state renders muted centered text.

- **HabitsCard**: Progress bar (4px, `--color-accent` fill), "N/N done" label, streak highlights (up to 2, accent color), "No habits scheduled today" empty state. Full keyboard support (Enter/Space), `focus-ring` class, `role="button"`.
- **TasksCard**: Task list (up to 5), overdue badge (`rgba(245,158,11,0.15)` bg, `--color-warning` text), "N remaining" when more exist, "No tasks for today" empty state.
- **SpendingCard**: `formatPeso()` divides centavos by 100, category rows with colored 8px dots, "₱0 spent today" empty state.

Replaced dashboard placeholder in `App.tsx` with `<ErrorBoundary><DashboardView onNavigate={setActiveModule} /></ErrorBoundary>`.

## Commits

| Hash | Message |
|------|---------|
| 209fa4a | test(03-01): add failing tests for dashboard aggregation logic |
| aa6f78e | feat(03-01): dashboard IPC handler, types, preload bridge, and CSS tokens |
| da67522 | feat(03-01): DashboardView with habits, tasks, and spending cards |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Node.js version mismatch for better-sqlite3**
- **Found during:** Task 1, running tests
- **Issue:** `better_sqlite3.node` compiled for NODE_MODULE_VERSION 140 but system node is v20 (NMV 115)
- **Fix:** Ran `npm rebuild better-sqlite3` to recompile native module for current node version
- **Files modified:** node_modules (binary only, not committed)

**2. [Rule 1 - Bug] Test SQL parameter count mismatch**
- **Found during:** Task 1, first GREEN test run
- **Issue:** Habits INSERT SQL had 3 `?` placeholders but tests passed 5 values (extra trailing position value)
- **Fix:** Removed extra `0` argument from `.run()` calls in Test 1 and Test 5
- **Files modified:** tests/dashboard-ipc.test.ts

## Known Stubs

None — all three cards display real data from the `dashboard:getToday` IPC call. Empty states render correctly when no data exists.

## Self-Check: PASSED

Files exist:
- src/main/ipc/dashboard.ts: FOUND
- src/renderer/dashboard/DashboardView.tsx: FOUND
- src/renderer/dashboard/HabitsCard.tsx: FOUND
- src/renderer/dashboard/TasksCard.tsx: FOUND
- src/renderer/dashboard/SpendingCard.tsx: FOUND
- tests/dashboard-ipc.test.ts: FOUND

Commits verified:
- 209fa4a: test(03-01) RED tests
- aa6f78e: feat(03-01) IPC handler
- da67522: feat(03-01) DashboardView

Test results: 42/42 passing, 0 regressions.
