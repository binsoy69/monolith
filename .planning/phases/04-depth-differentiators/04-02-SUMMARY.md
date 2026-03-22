---
phase: 04-depth-differentiators
plan: 02
subsystem: planner
tags: [planner, carry-forward, priority, overdue, ipc, sqlite, zustand]
dependency_graph:
  requires: [04-01]
  provides:
    - carry-forward transaction for today's planner/dashboard queries
    - priority-aware task contract and renderer badges
    - overdue-safe task aggregation using carried_from_date
    - planner row carry/overdue indicators
  affects: [04-03, dashboard, planner, shared-types]
tech_stack:
  added: []
  patterns:
    - Carry-forward runs in repository-backed today queries, not as a renderer-side startup effect
    - Original due dates are preserved in carried_from_date and cleared only on manual reschedule
    - Planner priority stays on the existing flat context menu instead of introducing nested menus
key_files:
  created:
    - tests/planner-depth-repository.test.ts
  modified:
    - src/main/db/migrations.ts
    - src/main/ipc/dashboard.ts
    - src/main/ipc/planner.ts
    - src/main/repositories/PlannerRepository.ts
    - src/renderer/planner/PlannerView.tsx
    - src/renderer/planner/TaskRow.tsx
    - src/renderer/planner/planner-store.ts
    - src/shared/domain-types.ts
    - src/shared/ipc-types.ts
    - tests/dashboard-ipc.test.ts
decisions:
  - "Carry-forward executes inside planner and dashboard 'today' query paths so both surfaces see the same moved task set"
  - "Original due dates are preserved in carried_from_date, and manual date edits clear it to distinguish deliberate reschedules from automatic carry-forward"
  - "Priority stays as flat context-menu actions (Set P1/P2/P3/Clear) to match the existing shared ContextMenu component"
  - "Carry-forward border remains visible for completed tasks, while overdue copy stays a small lowercase warning marker"
requirements-completed: [PLAN-06, PLAN-07, PLAN-08]
metrics:
  duration_minutes: 13
  completed_date: "2026-03-23"
  tasks_completed: 2
  files_changed: 10
---

# Phase 04 Plan 02: Planner Depth Summary

**Automatic task carry-forward, P1/P2/P3 priorities, and overdue-aware planner rows shipped end-to-end without regressing existing planner reorder or dashboard aggregation**

## Performance

- **Duration:** 13 min
- **Started:** 2026-03-23T06:42:32+08:00
- **Completed:** 2026-03-23T06:55:47+08:00
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Added `carried_from_date` migration support, a transactional `carryForwardToDate()` repository flow, and carry-forward execution inside planner/dashboard today queries.
- Extended the shared task contract with `priority` and `carriedFromDate`, then round-tripped those fields through IPC, preload, and the planner store.
- Added planner context-menu priority actions plus task-row priority badges, carry-forward border treatment, and overdue copy.
- Landed Wave 0 coverage for carry-forward ordering, overdue preservation, and priority persistence, plus dashboard regression coverage for carried overdue tasks.

## Task Commits

Each task was committed atomically:

1. **Task 1: Planner persistence, carry-forward transaction, and overdue-aware aggregation** - `ba27716`, `b0e768c` (test -> feat)
2. **Task 2: Planner row UI for priorities, carried state, and overdue indicators** - `cf2c3b0` (feat)

**Plan metadata:** (docs commit pending)

## Files Created/Modified

- `src/main/db/migrations.ts` - Added Phase 4 planner migration for `carried_from_date`.
- `src/main/repositories/PlannerRepository.ts` - Added `priority`/`carriedFromDate` mapping, carry-forward transaction logic, and manual-reschedule clearing.
- `src/main/ipc/planner.ts` - Runs carry-forward before returning today's tasks.
- `src/main/ipc/dashboard.ts` - Runs carry-forward for today and counts overdue tasks using original due dates.
- `src/shared/domain-types.ts` - Added `TaskPriority` and `carriedFromDate` to the task model.
- `src/shared/ipc-types.ts` - Extended `PlannerAPI.update` typing with priority support.
- `src/renderer/planner/planner-store.ts` - Round-trips `priority` and `carriedFromDate` through store state and updates.
- `src/renderer/planner/PlannerView.tsx` - Added flat priority actions to the task context menu.
- `src/renderer/planner/TaskRow.tsx` - Added priority badges, carry border, overdue marker, and carried-date screen-reader text.
- `tests/planner-depth-repository.test.ts` - Wave 0 coverage for carry-forward, overdue preservation, and priorities.

## Decisions Made

- Carry-forward is repository-owned and invoked from query entry points so the dashboard and planner stay consistent on app open.
- `carried_from_date` holds the earliest missed date and survives repeated carry-forward passes until the user deliberately reschedules the task.
- Priority remains a flat context-menu action set because the shared menu component is intentionally simple and already fits the required UX.
- Task rows keep the carry border even when completed so the source context of a carried task does not disappear after check-off.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added schema-shape fallback for pre-migration task tables**
- **Found during:** Task 1 test implementation
- **Issue:** Existing in-memory tests and already-created databases can exercise the planner repository before migration 3 has added `carried_from_date`; selecting that column unconditionally would crash those paths.
- **Fix:** PlannerRepository and dashboard aggregation detect whether `carried_from_date` exists and gracefully fall back to the old shape when it does not.
- **Files modified:** `src/main/repositories/PlannerRepository.ts`, `src/main/ipc/dashboard.ts`
- **Verification:** `npx vitest run tests/planner-depth-repository.test.ts tests/dashboard-ipc.test.ts`
- **Committed in:** `b0e768c`

---

**Total deviations:** 1 auto-fixed (1 blocking compatibility fix)
**Impact on plan:** The deviation keeps Wave 2 compatible with older schemas and test fixtures without changing the intended Phase 4 behavior.

## Issues Encountered

- `npm run typecheck` still fails in unrelated pre-existing files outside `04-02` ownership: `src/renderer/expenses/ExpenseRow.tsx`, `src/renderer/planner/DailyNotesView.tsx`, `src/renderer/settings/SettingsView.tsx`, and `src/renderer/shared/useContextMenu.ts`.

## Known Stubs

None.

## Self-Check: PASSED

Files exist on disk:
- `tests/planner-depth-repository.test.ts`: EXISTS
- `src/main/repositories/PlannerRepository.ts`: EXISTS (updated)
- `src/renderer/planner/TaskRow.tsx`: EXISTS (updated)
- `src/renderer/planner/PlannerView.tsx`: EXISTS (updated)

Commits verified in git log:
- `ba27716`: test(04-02): add failing planner depth contract tests
- `b0e768c`: feat(04-02): implement planner carry-forward persistence
- `cf2c3b0`: feat(04-02): add planner priority and carry indicators

Automated verification:
- `npx vitest run tests/planner-depth-repository.test.ts tests/dashboard-ipc.test.ts` (pass)
- `npx vitest run tests/planner-repository.test.ts` (pass)
- `npm run typecheck` (fails only on pre-existing unrelated files outside `04-02`)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Expense analytics can build on the now-stable shared IPC/preload contracts from 04-01 and 04-02.
- Dashboard task aggregation is already carry-forward aware, so the expense wave no longer needs to touch planner logic.
- The repo still has unrelated baseline typecheck failures outside this plan, but Wave 2 introduced no remaining planner-owned type errors.

---
*Phase: 04-depth-differentiators*
*Completed: 2026-03-23*
