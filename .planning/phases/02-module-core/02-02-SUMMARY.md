---
phase: 02-module-core
plan: 02
subsystem: ui
tags: [electron, react, zustand, habits, context-menu, form, keyboard]

# Dependency graph
requires:
  - phase: 02-module-core
    plan: 01
    provides: Zustand habits store (createHabit, updateHabit, archiveHabit, setShowArchived), ContextMenu portal, useContextMenu hook, ModuleHeader with left/right slots

provides:
  - HabitForm: inline expandable create/edit form with name input and DayPicker
  - DayPicker: 7-day bitmask toggle row (Mon-Sun) with accent selected state
  - HabitContextMenu: right-click Edit/Archive via useContextMenu + ContextMenu portal
  - ArchiveConfirmation: inline card-replacing prompt with Archive/Keep Habit + destructive color
  - ArchivedHabitsView: archived habits list with name+days text, No archived habits empty state
  - ModuleHeader right slot: Show Archived toggle + + New Habit button
  - N keyboard shortcut: opens create form in habits module via newItemTrigger counter pattern

affects: [02-03-PLAN, 02-04-PLAN, 02-05-PLAN, 02-06-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "newItemTrigger counter in App.tsx: increment passes to HabitsView via prop, useEffect opens form when counter changes — avoids ref forwarding"
    - "DayPicker bitmask: 7-char string, index 0=Sun through index 6=Sat, visual order Mon-Sun uses index mapping [1,2,3,4,5,6,0]"
    - "Archive confirmation: swaps HabitCard in-place using archivingHabit state check in sort map — no separate list"

key-files:
  created:
    - src/renderer/habits/DayPicker.tsx
    - src/renderer/habits/HabitForm.tsx
    - src/renderer/habits/ArchiveConfirmation.tsx
    - src/renderer/habits/ArchivedHabitsView.tsx
  modified:
    - src/renderer/habits/HabitsView.tsx
    - src/renderer/habits/HabitCard.tsx
    - src/renderer/shell/KeyboardRouter.tsx
    - src/renderer/App.tsx

key-decisions:
  - "newItemTrigger counter (not ref/callback) passed to HabitsView: simplest approach, avoids forwardRef complexity, works for all future modules without refactoring"
  - "Archive confirmation swaps card in-place using id comparison in sorted map — avoids maintaining a separate confirmation list"
  - "HabitCard calls e.preventDefault() internally in handleContextMenu — parent only receives normalized React.MouseEvent"

patterns-established:
  - "Form open = list dims: opacity 0.6 + pointerEvents none on sibling list div"
  - "N key: App-level newItemTrigger counter, module watches via useEffect, opens own add flow"

requirements-completed: [HAB-01]

# Metrics
duration: 5min
completed: 2026-03-21
---

# Phase 02 Plan 02: Habit Create, Edit, Archive Flows Summary

**Full CRUD lifecycle for habits: inline HabitForm with DayPicker, right-click Edit/Archive context menu, inline ArchiveConfirmation card swap, archived view, and N keyboard shortcut**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-20T21:12:22Z
- **Completed:** 2026-03-20T21:17:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- HabitForm + DayPicker: inline create/edit form with bitmask day picker (Mon-Sun visual order), auto-focus, Enter to submit, Escape to cancel, list dims to opacity 0.6 when open
- Context menu: right-click on HabitCard shows Edit/Archive via useContextMenu hook + ContextMenu portal; Edit pre-fills HabitForm, Archive shows ArchiveConfirmation in place of card
- Archive flow: ArchiveConfirmation replaces HabitCard inline (same dimensions), destructive Archive button + Keep Habit cancel, optimistic archiveHabit via store
- Archived view: ArchivedHabitsView lists archived habit names with formatted days (Mon, Wed, Fri / Every day), No archived habits empty state
- N keyboard shortcut: KeyboardRouter gets activeModule + onNewItem props, App.tsx passes newItemTrigger counter to HabitsView, form opens on counter change

## Task Commits

Each task was committed atomically:

1. **Task 1: HabitForm, DayPicker, and keyboard shortcut** - `472c5e8` (feat)
2. **Task 2: Context menu, archive confirmation, and archived view** - `fedd558` (feat, absorbed into parallel 02-03 agent commit)

## Files Created/Modified

**Created (4 files):**
- `src/renderer/habits/DayPicker.tsx` - 7-day toggle row, Mon-Sun visual order, bitmask index [1,2,3,4,5,6,0], accent fill for selected
- `src/renderer/habits/HabitForm.tsx` - Inline form, bg-elevated card, border-focused on input focus, DayPicker + action buttons
- `src/renderer/habits/ArchiveConfirmation.tsx` - Card-replacing inline prompt, destructive Archive + secondary Keep Habit, Escape cancel
- `src/renderer/habits/ArchivedHabitsView.tsx` - Archived habits list, formatDaysOfWeek helper, No archived habits empty state

**Modified (4 files):**
- `src/renderer/habits/HabitsView.tsx` - showForm/editingHabit/archivingHabit state, ModuleHeader right slot, useContextMenu wiring, context menu items, ArchiveConfirmation swap in sorted map
- `src/renderer/habits/HabitCard.tsx` - Internal handleContextMenu with e.preventDefault(), title tooltip "Not scheduled for today" for unscheduled habits
- `src/renderer/shell/KeyboardRouter.tsx` - Added activeModule + onNewItem props, n/N key handler in non-editing block
- `src/renderer/App.tsx` - newItemTrigger state + handleNewItem callback, passes to KeyboardRouter and HabitsView

## Decisions Made

- **newItemTrigger counter pattern:** App-level integer counter increments on N key. HabitsView watches via useEffect and opens form. Simplest approach, avoids ref forwarding or callback drilling through ErrorBoundary. Future modules (planner, expenses) receive same counter and handle independently.
- **Archive confirmation inline swap:** When `archivingHabit.id === habit.id` in the sorted map, render ArchiveConfirmation instead of HabitCard. No separate state array needed — the existing sort order is preserved.
- **HabitCard e.preventDefault() internal:** handleContextMenu calls e.preventDefault() before invoking the parent prop. Parent's showContextMenu doesn't need to call preventDefault again — cleaner separation.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

**Parallel agent absorption:** The 02-03 parallel agent picked up my Task 2 files (ArchiveConfirmation.tsx, ArchivedHabitsView.tsx, HabitCard.tsx) and committed them as part of its `fedd558` commit. All files are correctly committed with identical content. Both task commits are tracked.

## Known Stubs

None — all wiring is complete. ArchivedHabitsView calls `window.api.habits.listArchived()` which is fully implemented in the HabitRepository (from plan 02-01).

## Next Phase Readiness

- Full HAB-01 requirement satisfied: create with schedule, edit, archive with confirmation, archived view, N shortcut
- Shared patterns ready: N key shortcut pattern, context menu pattern, inline confirmation pattern all established for planner (02-03) and expenses (02-05) plans
- HabitsView self-manages its ModuleHeader — other module views should follow same pattern (PlannerView, ExpensesView render their own ModuleHeader)

---
*Phase: 02-module-core*
*Completed: 2026-03-21*
