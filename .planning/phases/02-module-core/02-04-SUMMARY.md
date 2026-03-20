---
phase: 02-module-core
plan: "04"
subsystem: ui
tags: [react, dnd-kit, zustand, sqlite, planner, drag-and-drop]

# Dependency graph
requires:
  - phase: 02-module-core-03
    provides: "planner IPC handlers, TaskList/TaskRow, planner-store with toggleComplete/navigateDay"

provides:
  - "@dnd-kit/sortable drag-and-drop reorder for incomplete tasks only"
  - "TaskEditForm — inline title+notes edit form below task row"
  - "DeleteConfirmation — inline 36px confirmation row with Delete/Keep Task"
  - "DailyNotesView — plain auto-saving textarea with 500ms debounce"
  - "Context menu: Edit, Move to date, Delete on right-click"
  - "planner-store: updateTask, deleteTask, reorderTasks, saveNotes, setNotesContent"
  - "KeyboardRouter: ArrowLeft/Right day nav, T key jumps to today (planner-only)"
  - "PlannerRepository reorder unit tests (3 tests)"

affects: [02-05, 02-06, 03-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "@dnd-kit/sortable SortableContext wraps only incomplete tasks — completed tasks render as plain divs (non-draggable)"
    - "useSortable hook with 5px activationConstraint — listeners spread on drag handle div only, not entire row"
    - "DailyNotesView uses hasChanged ref to skip debounce on initial load, flushes pending save on date change"
    - "planner-store optimistic updates: reorderTasks updates positions via id-to-index map, rolls back on IPC error"

key-files:
  created:
    - "src/renderer/planner/TaskEditForm.tsx"
    - "src/renderer/planner/DeleteConfirmation.tsx"
    - "src/renderer/planner/DailyNotesView.tsx"
    - "tests/planner-repository.test.ts"
  modified:
    - "src/renderer/planner/TaskList.tsx"
    - "src/renderer/planner/TaskRow.tsx"
    - "src/renderer/planner/PlannerView.tsx"
    - "src/renderer/planner/planner-store.ts"
    - "src/renderer/shell/KeyboardRouter.tsx"
    - "src/renderer/App.tsx"

key-decisions:
  - "SortableContext wraps only incompleteTasks array — completed tasks are rendered as PlainTaskRow (no useSortable) per research pitfall 4"
  - "DailyNotesView uses hasChanged ref pattern to skip the initial load sync triggering the 500ms debounce — same guard as settings auto-save"
  - "TaskRow exports a single TaskRow function that delegates to SortableTaskRow or PlainTaskRow based on isDraggable prop — clean separation without duplicate JSX"
  - "Move-to-date uses a hidden native <input type=date> positioned at context menu click point — no custom date picker needed"
  - "App.tsx imports usePlannerStore to pass navigateDay/goToToday to KeyboardRouter — keeps planner state in its own store, App just bridges"

patterns-established:
  - "Pattern: TaskList accepts editingTaskId/deletingTaskId as controlled state from parent (PlannerView) — inline UI toggled via these props"
  - "Pattern: isDeleting replaces the task row entirely with DeleteConfirmation component at same height (36px)"
  - "Pattern: isEditing renders TaskEditForm below the task row via conditional in TaskRow body"

requirements-completed: [PLAN-02, PLAN-05, PLAN-09]

# Metrics
duration: 15min
completed: 2026-03-21
---

# Phase 02 Plan 04: Planner Completion Summary

**Drag-and-drop reorder with @dnd-kit/sortable, inline edit/delete, move-to-date context menu, keyboard day navigation, and 500ms debounced daily notes**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-21T05:22:00Z
- **Completed:** 2026-03-21T05:28:00Z
- **Tasks:** 2/2
- **Files modified:** 10

## Accomplishments

- Planner task list now supports drag-and-drop reordering (incomplete tasks only, 5px drag threshold, drag handle)
- Inline edit form slides open below row (title + notes, Enter saves, Escape cancels, auto-focuses title)
- Inline delete confirmation row (36px, "Delete this task?" / Delete / Keep Task)
- Right-click context menu with Edit, Move to date, Delete options
- planner-store: updateTask, deleteTask, reorderTasks (optimistic + rollback), saveNotes
- KeyboardRouter: ArrowLeft/Right navigate days, T jumps to today (planner module only, disabled in inputs)
- DailyNotesView: plain textarea with 500ms auto-save debounce, flushes on date change, no markdown
- All 37 project tests pass, TypeScript compiles cleanly

## Task Commits

1. **Test (TDD RED+GREEN): planner-repository reorder unit tests** - `c9b5981` (test)
2. **Task 1: Drag-and-drop, edit/delete, keyboard nav** - `5a76ca0` (feat)
3. **Task 2: Daily notes with debounced auto-save** - `1ceb636` (feat)

## Files Created/Modified

- `tests/planner-repository.test.ts` — 3 unit tests for reorder: position order, atomicity, date isolation
- `src/renderer/planner/TaskList.tsx` — DndContext + SortableContext on incomplete tasks, handleDragEnd
- `src/renderer/planner/TaskRow.tsx` — SortableTaskRow (useSortable + listeners on handle) + PlainTaskRow for completed
- `src/renderer/planner/TaskEditForm.tsx` — Inline form: title input + notes textarea, Enter/Escape keyboard handlers
- `src/renderer/planner/DeleteConfirmation.tsx` — 36px row: "Delete this task?" + Delete/Keep Task buttons
- `src/renderer/planner/DailyNotesView.tsx` — Plain textarea, 500ms debounce, hasChanged ref to skip initial load
- `src/renderer/planner/PlannerView.tsx` — Context menu wiring, edit/delete state, DailyNotesView integration
- `src/renderer/planner/planner-store.ts` — updateTask, deleteTask, reorderTasks, saveNotes, setNotesContent
- `src/renderer/shell/KeyboardRouter.tsx` — ArrowLeft/Right + T key handlers (planner module only)
- `src/renderer/App.tsx` — Passes plannerNavigateDay + plannerGoToToday to KeyboardRouter

## Decisions Made

- SortableContext wraps only `incompleteTasks` array — completed tasks render as `PlainTaskRow` (no `useSortable`), per research pitfall 4 (dragging completed tasks back into incomplete list must be prevented)
- `TaskRow` exports a single function delegating to `SortableTaskRow` or `PlainTaskRow` via `isDraggable` prop — avoids duplicating JSX at the call site
- Move-to-date uses a hidden `<input type="date">` positioned at context menu click coordinates — native browser date picker, no custom implementation needed
- `DailyNotesView` uses a `hasChanged` ref to distinguish initial load (don't debounce) from user changes (do debounce) — same guard pattern as settings auto-save from Phase 1
- `App.tsx` imports `usePlannerStore` directly to pass `navigateDay`/`goToToday` to `KeyboardRouter` — keeps store-level state in the planner module, App just bridges

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. All TypeScript compiled cleanly. All 37 tests pass.

## Known Stubs

None — all functionality is wired end-to-end. DailyNotesView calls `loadNotes`/`saveNotes` via real IPC. TaskList calls `reorderTasks` via real IPC. Context menu actions call `updateTask`/`deleteTask` via real IPC.

## Next Phase Readiness

- Planner module is fully functional: add, check off, reorder, edit, delete, move, daily notes, keyboard nav
- PLAN-02, PLAN-05, PLAN-09 requirements are complete
- Ready for Phase 02-05 (Expense module) or 02-06 (final integration)

---
*Phase: 02-module-core*
*Completed: 2026-03-21*
