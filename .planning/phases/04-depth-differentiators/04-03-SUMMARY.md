---
phase: 04-depth-differentiators
plan: 03
subsystem: expenses
tags: [expenses, analytics, recharts, ipc, sqlite, zustand]
dependency_graph:
  requires: [04-02]
  provides:
    - dedicated expense analytics repository and IPC contract
    - zero-filled 3 / 6 / 12 month trend windows
    - collapsible inline analytics surface above the expense list
    - custom-themed donut and trend charts matching the app token set
  affects: [expenses, preload, shared-types]
tech_stack:
  added:
    - recharts
  patterns:
    - Analytics load through a dedicated contract that never reads or mutates list filters
    - Trend windows are zero-filled in the repository so the renderer toggle can stay presentation-only
    - Charts replace default Recharts legend and tooltip chrome with app-themed inline UI
key_files:
  created:
    - src/renderer/expenses/ExpenseAnalyticsSection.tsx
    - src/renderer/expenses/ExpenseDonutChart.tsx
    - src/renderer/expenses/ExpenseTrendChart.tsx
    - tests/expense-analytics-ipc.test.ts
  modified:
    - package.json
    - package-lock.json
    - src/main/ipc/expenses.ts
    - src/main/repositories/ExpenseRepository.ts
    - src/preload/index.ts
    - src/renderer/expenses/ExpensesView.tsx
    - src/renderer/expenses/expenses-store.ts
    - src/shared/ipc-types.ts
decisions:
  - "Expense analytics live behind expenses:getAnalytics so charts stay independent from expense-list filters"
  - "Trend windows are zero-filled in the repository and include the selected month plus the preceding months"
  - "Analytics stay collapsed by default above the list so the module keeps its dense list-first workflow"
  - "Donut legend rows and trend tooltip/grid are custom-themed inline instead of exposing visible Recharts defaults"
requirements-completed: [EXP-04, EXP-05, EXP-10]
metrics:
  duration_minutes: 8
  completed_date: "2026-03-23"
  tasks_completed: 2
  files_changed: 12
---

# Phase 04 Plan 03: Expense Analytics Summary

**Inline monthly expense analytics, category breakdown, and 3M / 6M / 12M trend charts shipped without disturbing the existing wallet panel, filters, or dense expense list workflow**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-23T07:05:41+08:00
- **Completed:** 2026-03-23T07:13:51+08:00
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Added a dedicated `ExpenseAnalytics` contract plus `expenses:getAnalytics` IPC wiring through shared types, preload, and the expense store.
- Implemented repository analytics queries for current-month totals, descending category breakdown, and zero-filled 3 / 6 / 12 month trend windows.
- Installed `recharts` and delivered a collapsible analytics surface above `ExpenseList` with a donut chart, trend chart, and month-window toggle.
- Landed Wave 0 coverage for month totals, category percentages, and zero-filled trend ranges, then verified the full Phase 4 regression pack.

## Task Commits

Each task was committed atomically:

1. **Task 1: Analytics contract, dependency, repository queries, IPC, and Wave 0 tests** - `a063f24`, `799c5d7` (test -> feat)
2. **Task 2: ExpensesView analytics section with themed donut and trend charts** - `10d89b8` (feat)

## Files Created/Modified

- `package.json` - Added the `recharts` dependency required for the Phase 4 analytics UI.
- `package-lock.json` - Locked the new charting dependency graph.
- `src/shared/ipc-types.ts` - Added `ExpenseAnalytics`, breakdown/trend types, and `ExpensesAPI.getAnalytics`.
- `src/main/repositories/ExpenseRepository.ts` - Added analytics queries, month helpers, and zero-filled trend assembly.
- `src/main/ipc/expenses.ts` - Registered `expenses:getAnalytics`.
- `src/preload/index.ts` - Exposed `expenses.getAnalytics` to the renderer bridge.
- `src/renderer/expenses/expenses-store.ts` - Added analytics state, month-window selection, and dedicated analytics loading.
- `src/renderer/expenses/ExpensesView.tsx` - Loaded analytics for the current month, kept it separate from filters, and rendered the collapsible analytics section above the list.
- `src/renderer/expenses/ExpenseAnalyticsSection.tsx` - New analytics shell with monthly total header and chart layout.
- `src/renderer/expenses/ExpenseDonutChart.tsx` - New donut chart with center total and custom legend rows.
- `src/renderer/expenses/ExpenseTrendChart.tsx` - New trend chart with 3M / 6M / 12M toggle and custom tooltip.
- `tests/expense-analytics-ipc.test.ts` - Wave 0 contract tests for totals, percentages, and zero-filled trends.

## Decisions Made

- Expense analytics use a dedicated IPC contract so list filters stay focused on expense history rather than mutating chart state.
- The repository, not the renderer, zero-fills missing months so the chart toggle always receives a complete 3 / 6 / 12 point series.
- The analytics section stays collapsed by default to preserve the existing expense module density and avoid pushing the list down on first open.
- Recharts defaults are intentionally hidden behind custom legend and tooltip UI so the charts inherit the app's dark, dense design language.

## Deviations from Plan

None.

## Issues Encountered

- `npm run typecheck` still fails in unrelated pre-existing files outside `04-03` ownership: `src/renderer/expenses/ExpenseRow.tsx`, `src/renderer/planner/DailyNotesView.tsx`, `src/renderer/settings/SettingsView.tsx`, and `src/renderer/shared/useContextMenu.ts`.

## Known Stubs

None.

## Self-Check: PASSED

Files exist on disk:
- `src/renderer/expenses/ExpenseAnalyticsSection.tsx`: EXISTS
- `src/renderer/expenses/ExpenseDonutChart.tsx`: EXISTS
- `src/renderer/expenses/ExpenseTrendChart.tsx`: EXISTS
- `tests/expense-analytics-ipc.test.ts`: EXISTS

Commits verified in git log:
- `a063f24`: test(04-03): add failing expense analytics contract tests
- `799c5d7`: feat(04-03): add expense analytics contract and repository
- `10d89b8`: feat(04-03): add expense analytics charts

Automated verification:
- `npx vitest run tests/expense-analytics-ipc.test.ts` (pass)
- `npx vitest run tests/expense-analytics-ipc.test.ts tests/expense-repository.test.ts` (pass)
- `npx vitest run tests/habits-depth-ipc.test.ts tests/planner-depth-repository.test.ts tests/planner-repository.test.ts tests/dashboard-ipc.test.ts tests/expense-repository.test.ts tests/expense-analytics-ipc.test.ts` (pass)
- `npm run typecheck` (fails only on pre-existing unrelated files outside `04-03`)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All Phase 4 requirements are now implemented across habits, planner, and expenses.
- Phase 5 can build on the shared IPC/preload contracts and the newly added Recharts dependency without revisiting expense analytics plumbing.
- The repo still has unrelated baseline typecheck failures outside Phase 4 ownership, but Wave 3 introduced no remaining expense-owned type errors.

---
*Phase: 04-depth-differentiators*
*Completed: 2026-03-23*
