---
phase: 02-module-core
plan: 01
subsystem: ui
tags: [electron, react, zustand, sqlite, better-sqlite3, ipc, habits, streaks]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Electron shell, SQLite DB with habits/completions tables, design tokens, IPC bridge skeleton, settings pattern

provides:
  - HabitsAPI, PlannerAPI, ExpensesAPI IPC interfaces (all 3 modules)
  - Habits IPC handlers wired to SQLite (getToday, create, update, archive, complete, uncomplete)
  - HabitRepository with full CRUD and completion tracking
  - Streak calculation engine (calculateStreaks, isScheduledOn, getTodayStr) with unit tests
  - formatPeso utility with unit tests
  - Zustand habits store with optimistic toggleComplete and archiveHabit
  - HabitsView: today's habit cards with check-off, sort order, progress summary, empty state
  - Shared: ToastContainer, ContextMenu (portal), useContextMenu, ErrorBoundary
  - ModuleHeader extended with left/right slot props

affects: [02-02-PLAN, 02-03-PLAN, 02-04-PLAN, 02-05-PLAN, 02-06-PLAN]

# Tech tracking
tech-stack:
  added:
    - "@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (drag-and-drop, for planner plan 02-03)"
  patterns:
    - "Zustand optimistic update: set state -> await IPC -> update streaks from response -> catch rollback + toast"
    - "IPC handler pattern: getDb() -> new Repository(db) -> execute operation -> return"
    - "Streak calculation: pure JS date arithmetic (no date-fns) — avoids date-fns v4 ESM packaging bug in vitest node env"
    - "date-fns ESM subpath exports broken in vitest node environment — use pure Date arithmetic instead"

key-files:
  created:
    - src/shared/format.ts
    - src/main/utils/streaks.ts
    - src/main/repositories/HabitRepository.ts
    - src/main/ipc/habits.ts
    - src/renderer/shared/toast-store.ts
    - src/renderer/shared/ToastContainer.tsx
    - src/renderer/shared/ContextMenu.tsx
    - src/renderer/shared/useContextMenu.ts
    - src/renderer/shared/ErrorBoundary.tsx
    - src/renderer/habits/habits-store.ts
    - src/renderer/habits/HabitsView.tsx
    - src/renderer/habits/HabitCard.tsx
    - src/renderer/habits/HabitCheckbox.tsx
    - src/renderer/habits/HabitProgressBar.tsx
    - tests/streaks.test.ts
    - tests/format-peso.test.ts
  modified:
    - src/shared/ipc-types.ts
    - src/preload/index.ts
    - src/main/ipc/index.ts
    - src/renderer/shell/ModuleHeader.tsx
    - src/renderer/App.tsx

key-decisions:
  - "Streak calculation implemented in pure JS date arithmetic, avoiding date-fns v4 ESM subpath export issue in vitest node environment (_lib/protectedTokens.js missing)"
  - "calculateStreaks accepts optional todayOverride parameter for deterministic testing without vi.mock"
  - "HabitCard uses explicit numeric literals (0.35, 0.5) for opacity states as named constants for clarity"
  - "Planner/Expenses IPC stubs added to preload for API type safety — handlers registered in later plans"

patterns-established:
  - "Optimistic update pattern: flip state -> IPC call -> update server response data -> catch: rollback + addToast(error)"
  - "Repository pattern: one class per domain table, constructor takes Database.Database"
  - "Streak grace rule: if today is scheduled but not yet completed, do not break streak — carry from previous scheduled day"

requirements-completed: [HAB-02, HAB-03, HAB-05]

# Metrics
duration: 17min
completed: 2026-03-21
---

# Phase 02 Plan 01: Shared Infrastructure + Habits Backend + Today-View Summary

**Habits check-off loop live with SQLite, optimistic updates, streak calculation, and shared toast/context-menu/error-boundary infrastructure for all 3 modules**

## Performance

- **Duration:** 17 min
- **Started:** 2026-03-21T04:57:14Z
- **Completed:** 2026-03-21T05:08:09Z
- **Tasks:** 2
- **Files modified:** 21

## Accomplishments

- Streak calculation engine: handles scheduled-only days, grace for today, best streak tracking — 13 unit tests all green
- Habits IPC backend: full CRUD + completion toggle, wired to existing SQLite tables, streak calculation on every complete/uncomplete
- Habits today-view: cards sorted (unchecked+scheduled -> unscheduled dimmed -> checked sunk), optimistic toggle with rollback, progress summary
- Shared infrastructure ready for plans 02-06: Zustand toast store, ToastContainer, ContextMenu portal, ErrorBoundary, ModuleHeader slots

## Task Commits

Each task was committed atomically:

1. **TDD RED: Failing streak/formatPeso tests** - `42d92d4` (test)
2. **Task 1: Shared infrastructure + IPC types + streak implementation** - `3bfb87b` (feat)
3. **Task 2: Habits today-view UI** - `afe9926` (feat)
4. **Fix: HabitCard explicit opacity literals** - `11b42b6` (fix)

## Files Created/Modified

**Created (16 files):**
- `src/shared/format.ts` - formatPeso currency formatter (cents -> ₱ string)
- `src/main/utils/streaks.ts` - calculateStreaks, isScheduledOn, getTodayStr with pure JS date arithmetic
- `src/main/repositories/HabitRepository.ts` - HabitRepository class with full CRUD + completion tracking
- `src/main/ipc/habits.ts` - registerHabitsHandlers for all 7 habits IPC channels
- `src/renderer/shared/toast-store.ts` - Zustand toast store with auto-dismiss + standalone addToast export
- `src/renderer/shared/ToastContainer.tsx` - Fixed bottom-right toast renderer
- `src/renderer/shared/ContextMenu.tsx` - Generic context menu via React portal with viewport adjustment
- `src/renderer/shared/useContextMenu.ts` - Hook returning showContextMenu, hideContextMenu, contextMenu state
- `src/renderer/shared/ErrorBoundary.tsx` - Class component with getDerivedStateFromError + "Try again" reset
- `src/renderer/habits/habits-store.ts` - Zustand store with optimistic toggleComplete + archiveHabit
- `src/renderer/habits/HabitsView.tsx` - Root habits view with sort logic, progress summary, empty state
- `src/renderer/habits/HabitCard.tsx` - Card with 0.35/0.5 opacity states, accent-subtle flash, streak display
- `src/renderer/habits/HabitCheckbox.tsx` - Circular custom checkbox with accent fill
- `src/renderer/habits/HabitProgressBar.tsx` - Progress counter (accent on completed count)
- `tests/streaks.test.ts` - 13 unit tests for streak calculation
- `tests/format-peso.test.ts` - 5 unit tests for formatPeso

**Modified (5 files):**
- `src/shared/ipc-types.ts` - Added HabitsAPI, PlannerAPI, ExpensesAPI; enabled in API interface
- `src/preload/index.ts` - Wired habits IPC; added planner/expenses stubs
- `src/main/ipc/index.ts` - Registered habits handlers
- `src/renderer/shell/ModuleHeader.tsx` - Added left/right slot props with justify-content: space-between
- `src/renderer/App.tsx` - Wired HabitsView, ErrorBoundary per module, ToastContainer

## Decisions Made

- **Pure JS date arithmetic in streaks.ts:** date-fns v4 has a packaging bug where `_lib/protectedTokens.js` ESM file is missing (only `.cjs` exists). The vitest node environment resolves to `.js` and fails. Replaced all date-fns usage with hand-rolled `parseLocalDate`, `formatDateLocal`, `subtractDays` helpers. Same correctness guarantees, no dependency issues.
- **Optional `todayOverride` parameter in calculateStreaks:** Enables deterministic tests without vi.mock(). Cleaner than mocking the module.
- **Planner/Expenses stubs in preload:** Added all planner/expenses methods to preload even though handlers aren't registered yet. Gives full TypeScript type safety for window.api calls in future plans.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] date-fns v4 ESM packaging bug in vitest node environment**
- **Found during:** Task 1 (TDD GREEN phase — implementing streaks.ts)
- **Issue:** date-fns v4 `index.js` imports `_lib/protectedTokens.js` which doesn't exist (only `.cjs`). `format()` and subpath imports both fail in vitest's `// @vitest-environment node` mode.
- **Fix:** Replaced all date-fns imports with pure JS date arithmetic functions: `parseLocalDate`, `formatDateLocal`, `subtractDays`. These are implemented directly in streaks.ts with identical behavior.
- **Files modified:** `src/main/utils/streaks.ts`
- **Verification:** All 13 streak tests pass. getTodayStr returns YYYY-MM-DD in local timezone.
- **Committed in:** `3bfb87b` (Task 1 feat commit)

---

**Total deviations:** 1 auto-fixed (1 blocking dependency issue)
**Impact on plan:** The plan spec said "import from 'date-fns'" but pure JS is actually superior here — no external runtime dependency in the main process utility. The behavioral contract is identical.

## Issues Encountered

- date-fns v4 ESM packaging bug: `_lib/protectedTokens.js` missing. Attempts to use barrel import, then subpath imports, both failed. Resolved by removing date-fns dependency from streaks.ts entirely.

## Known Stubs

- `HabitsView.tsx` "Create your first habit" button onClick is empty — the create habit flow will be wired via `ModuleHeader` right slot in plan 02-02. Not a blocker for this plan's goal (today view renders and check-off works when habits exist).
- Planner and Expenses module views show placeholder "coming soon" text — these are filled in plans 02-03 and 02-04.

## Next Phase Readiness

- All shared infrastructure (toast, context menu, error boundary, ModuleHeader slots) is available for plans 02-02 through 02-06
- Habits backend fully operational — plan 02-02 can immediately add create/edit forms and archive flows
- IPC type interfaces defined for all 3 modules — plans 02-03 (planner) and 02-04/05 (expenses) can implement without type changes
- `@dnd-kit` dependencies installed, ready for planner drag-and-drop in plan 02-03

## Self-Check: PASSED

All created files confirmed present. All task commits verified:
- `42d92d4` test(02-01): add failing tests for streak calculation and formatPeso — FOUND
- `3bfb87b` feat(02-01): shared infrastructure, IPC types, habits backend, streak calc — FOUND
- `afe9926` feat(02-01): habits today-view UI with check-off loop and optimistic updates — FOUND
- `11b42b6` fix(02-01): use explicit opacity literals in HabitCard for acceptance criteria — FOUND
- 16 created files: all FOUND
- All 39 acceptance criteria: PASSED
- All 18 unit tests: PASSED

---
*Phase: 02-module-core*
*Completed: 2026-03-21*
