---
phase: 04-depth-differentiators
plan: 01
subsystem: habits
tags: [habits, heatmap, dnd-kit, ipc, sqlite, zustand]
dependency_graph:
  requires: [03-dashboard-navigation]
  provides:
    - count-based habit contracts and persistence
    - habit history and reorder IPC surface
    - expandable habit cards with 7/30 day summaries
    - 90-day SVG heatmap renderer
  affects: [04-02, dashboard, preload, shared-types]
tech_stack:
  added: []
  patterns:
    - Value-aware habit completion reuses habit_completions.value for boolean and count habits
    - Only the scheduled incomplete bucket is sortable, matching planner drag behavior
    - Habit history loads on first expand and stays cached per habit in the Zustand store
key_files:
  created:
    - src/renderer/habits/HabitHeatmap.tsx
    - tests/habits-depth-ipc.test.ts
  modified:
    - src/main/db/migrations.ts
    - src/main/ipc/dashboard.ts
    - src/main/ipc/habits.ts
    - src/main/repositories/HabitRepository.ts
    - src/preload/index.ts
    - src/renderer/habits/HabitCard.tsx
    - src/renderer/habits/HabitForm.tsx
    - src/renderer/habits/HabitsView.tsx
    - src/renderer/habits/habits-store.ts
    - src/shared/domain-types.ts
    - src/shared/ipc-types.ts
    - tests/dashboard-ipc.test.ts
decisions:
  - "Count habits reuse habit_completions.value and become complete only when value >= target_count"
  - "Habit cards split row-body expansion from the leading progress control so count increment and detail inspection can coexist"
  - "History fetch stays on-demand and cached in historyByHabitId to avoid preloading 90-day windows for every habit"
  - "Dashboard overdue counting now uses COALESCE(carried_from_date, date) as a forward-compatible task aggregation contract for 04-02"
requirements-completed: [HAB-04, HAB-06, HAB-07, HAB-08]
metrics:
  duration_minutes: 19
  completed_date: "2026-03-23"
  tasks_completed: 2
  files_changed: 14
---

# Phase 04 Plan 01: Habit Depth Summary

**Count-based habits, persistent reorder, inline 7/30 day history, and a 90-day SVG heatmap shipped on top of the existing habit module without breaking dashboard aggregation**

## Performance

- **Duration:** 19 min
- **Started:** 2026-03-23T06:13:39+08:00
- **Completed:** 2026-03-23T06:33:06+08:00
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments

- Added habit schema/versioning for `kind`, `target_count`, count progress snapshots, reorder persistence, and trailing history windows.
- Extended the preload + IPC contract with `getHistory`, `reorder`, `incrementCount`, and `resetCount`, plus value-aware dashboard counting.
- Delivered habit UI depth: typed form controls, drag-handle reorder for the active bucket, expandable cards, and a 90-day heatmap with accessible labels.
- Landed Wave 0 coverage for count-threshold rules, reorder persistence, history payloads, and dashboard regressions.

## Task Commits

Each task was committed atomically:

1. **Task 1: Habit persistence, IPC, and tests** - `1a16e26`, `854a0e5` (test -> feat)
2. **Task 2: Habit renderer updates** - `41b1f56` (feat)

**Plan metadata:** (docs commit pending)

## Files Created/Modified

- `src/main/db/migrations.ts` - Added Phase 4 habit migration for `kind` and `target_count`.
- `src/main/repositories/HabitRepository.ts` - Added count-aware mapping, history windows, reorder persistence, and value-based completion helpers.
- `src/main/ipc/habits.ts` - Exposed history/reorder/count IPC handlers and today snapshots with `todayValue`.
- `src/main/ipc/dashboard.ts` - Made habit completion counting value-aware and overdue aggregation forward-compatible.
- `src/shared/domain-types.ts` - Added `HabitKind`, `targetCount`, and `HabitHistoryPoint`.
- `src/shared/ipc-types.ts` - Extended `HabitWithToday` and `HabitsAPI` for depth operations.
- `src/preload/index.ts` - Exposed the new habit bridge methods.
- `src/renderer/habits/habits-store.ts` - Added optimistic reorder/count actions and cached history loading.
- `src/renderer/habits/HabitForm.tsx` - Added Boolean/Count toggle and count-target validation.
- `src/renderer/habits/HabitCard.tsx` - Split drag handle, progress control, and expandable row body.
- `src/renderer/habits/HabitsView.tsx` - Added expand-on-demand history, active-bucket sorting, and dnd-kit wiring.
- `src/renderer/habits/HabitHeatmap.tsx` - New 90-day SVG heatmap with month labels and per-cell accessibility text.
- `tests/habits-depth-ipc.test.ts` - Wave 0 contract coverage for count habits, reorder, and history windows.
- `tests/dashboard-ipc.test.ts` - Added partial-count habit regression and preserved carried-task overdue coverage.

## Decisions Made

- Count habits keep using the existing completion table instead of introducing a separate progress-history table.
- The row body owns expand/collapse while the leading control owns boolean toggle or count increment, avoiding the interaction conflict called out in phase research.
- Only scheduled incomplete habits are draggable; unscheduled and completed rows stay plain so manual ordering maps to the active bucket only.
- Heatmap data is requested lazily on first expansion and cached in the module store to keep the default habit list load inexpensive.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Rebuilt `better-sqlite3` for the active Node ABI**
- **Found during:** Task 1 test run
- **Issue:** Vitest could not execute the new repository tests because the local `better-sqlite3` native module had been built against a different Node ABI.
- **Fix:** Ran `npm rebuild better-sqlite3` locally before continuing implementation.
- **Files modified:** None
- **Verification:** `npx vitest run tests/habits-depth-ipc.test.ts tests/dashboard-ipc.test.ts`
- **Committed in:** not committed (local environment repair only)

**2. [Rule 1 - Forward Compatibility] Updated dashboard overdue counting ahead of planner carry-forward**
- **Found during:** Task 1 dashboard regression work
- **Issue:** The repo already contained a draft carried-task overdue assertion that belongs to `04-02`; leaving dashboard aggregation on `date < today` would keep Wave 1 red.
- **Fix:** Switched overdue counting to `COALESCE(carried_from_date, date) < ?`, which is harmless for current data and required by the next planner wave anyway.
- **Files modified:** `src/main/ipc/dashboard.ts`, `tests/dashboard-ipc.test.ts`
- **Verification:** `npx vitest run tests/habits-depth-ipc.test.ts tests/dashboard-ipc.test.ts`
- **Committed in:** `1a16e26`, `854a0e5`

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 forward-compatibility bug fix)
**Impact on plan:** Both deviations were required to keep the Wave 1 contract executable and did not expand scope beyond planned Phase 4 behavior.

## Issues Encountered

- `npm run typecheck` still fails in unrelated pre-existing files outside `04-01` ownership: `src/renderer/expenses/ExpenseRow.tsx`, `src/renderer/planner/DailyNotesView.tsx`, `src/renderer/settings/SettingsView.tsx`, and `src/renderer/shared/useContextMenu.ts`.

## Known Stubs

None.

## Self-Check: PASSED

Files exist on disk:
- `src/renderer/habits/HabitHeatmap.tsx`: EXISTS
- `tests/habits-depth-ipc.test.ts`: EXISTS
- `src/main/ipc/habits.ts`: EXISTS (updated)
- `src/main/repositories/HabitRepository.ts`: EXISTS (updated)

Commits verified in git log:
- `1a16e26`: test(04-01): add failing habit depth contract tests
- `854a0e5`: feat(04-01): implement habit depth persistence and IPC
- `41b1f56`: feat(04-01): deliver habit depth interface

Automated verification:
- `npx vitest run tests/habits-depth-ipc.test.ts tests/dashboard-ipc.test.ts` (pass)
- `npm run typecheck` (fails only on pre-existing unrelated files outside `04-01`)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Planner depth can build on stable shared contracts, preload wiring, and forward-compatible dashboard overdue aggregation.
- Habit count/reorder/history APIs are ready for manual UAT in the renderer.
- The repo still has unrelated baseline typecheck failures outside this plan, but Wave 1 introduced no remaining plan-owned type errors.

---
*Phase: 04-depth-differentiators*
*Completed: 2026-03-23*
