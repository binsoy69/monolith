---
phase: 02-module-core
plan: 09
subsystem: ui
tags: [react, electron, calendar, ipc, sqlite]

# Dependency graph
requires:
  - phase: 02-module-core
    provides: PlannerRepository, planner IPC handlers, ExpenseFilterBar, DateNav, PlannerView

provides:
  - Shared CalendarPopup component (dark-themed, monthly grid, task dots, click-outside)
  - getDatesWithTasks IPC endpoint (PlannerRepository + handler + preload binding)
  - DateNav with formatted date label and calendar popup on click
  - PlannerView move-to-date via CalendarPopup (replaces native date input)
  - ExpenseFilterBar From/To date pickers via CalendarPopup

affects: [03-dashboard, 04-advanced-features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shared popup component with click-outside via mousedown listener on document"
    - "CalendarPopup renders inline (position: absolute) or floating (position: fixed) via position prop"
    - "Pure JS date arithmetic for calendar grid — no date-fns (avoids ESM packaging bug)"

key-files:
  created:
    - src/renderer/shared/CalendarPopup.tsx
  modified:
    - src/main/repositories/PlannerRepository.ts
    - src/main/ipc/planner.ts
    - src/preload/index.ts
    - src/shared/ipc-types.ts
    - src/renderer/planner/DateNav.tsx
    - src/renderer/planner/PlannerView.tsx
    - src/renderer/expenses/ExpenseFilterBar.tsx

key-decisions:
  - "CalendarPopup position prop: when provided uses position:fixed at click coords; when absent renders position:absolute below trigger — single component handles both use cases"
  - "CalendarPopup click does NOT auto-close; parent controls close lifecycle (onSelect callback + setShowCalendar false)"
  - "getDatesWithTasks uses parameterized LIKE query ('YYYY-MM-%') — avoids string interpolation SQL injection"
  - "ExpenseFilterBar date display uses short-month format (Mar 21, 2026) for consistency with DateNav"

patterns-established:
  - "Calendar popup: click-outside via document mousedown listener cleaned up in useEffect return"
  - "Mon-first grid: firstDayMonFirst = (firstDayOfMonth + 6) % 7 — standard Sun-to-Mon conversion"

requirements-completed: [PLAN-03, PLAN-04, PLAN-05]

# Metrics
duration: 15min
completed: 2026-03-21
---

# Phase 02 Plan 09: Calendar Popup Summary

**Shared dark-themed CalendarPopup component wired into planner date nav, move-to-date, and expense filters — replacing all native date picker usage**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-21T00:00:00Z
- **Completed:** 2026-03-21T00:15:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Built CalendarPopup: monthly grid, task dots via IPC, click-outside close, dark theme, viewport-safe fixed positioning
- Added `getDatesWithTasks` IPC endpoint (PlannerRepository + handler + preload + ipc-types)
- DateNav now always shows formatted date with "Today, " prefix and opens calendar popup on click
- PlannerView move-to-date uses CalendarPopup instead of hidden native input element
- ExpenseFilterBar From/To replaced with styled CalendarPopup pickers showing short-month format

## Task Commits

Each task was committed atomically:

1. **Task 1: Backend IPC endpoint + CalendarPopup component** - `8fbcc2c` (feat)
2. **Task 2: Wire CalendarPopup into DateNav, move-to-date, and expense filters** - `ace9331` (feat)

**Plan metadata:** (docs commit pending)

## Files Created/Modified

- `src/renderer/shared/CalendarPopup.tsx` - Reusable dark-themed calendar popup component
- `src/main/repositories/PlannerRepository.ts` - Added getDatesWithTasks method
- `src/main/ipc/planner.ts` - Registered planner:getDatesWithTasks IPC handler
- `src/preload/index.ts` - Added getDatesWithTasks to planner section
- `src/shared/ipc-types.ts` - Added getDatesWithTasks to PlannerAPI interface
- `src/renderer/planner/DateNav.tsx` - Formatted date label + calendar popup on click
- `src/renderer/planner/PlannerView.tsx` - CalendarPopup for move-to-date; removed native input
- `src/renderer/expenses/ExpenseFilterBar.tsx` - CalendarPopup for From/To date pickers

## Decisions Made

- CalendarPopup uses a dual-mode position prop: `position: fixed` at click coords when provided, `position: absolute` below trigger when absent — single component covers all placement scenarios.
- Click does NOT auto-close on select — parent controls close lifecycle to allow chaining (e.g., navigating before closing).
- `getDatesWithTasks` uses parameterized LIKE query to avoid SQL injection.
- ExpenseFilterBar date display format is "Mar 21, 2026" (short month, day, year) matching the visual style of DateNav labels.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None — all date pickers are fully wired to real data sources.

## Next Phase Readiness

- UAT tests 7, 10, 16 gaps resolved: planner formatted date + calendar popup with task dots, move-to-date styled, expense filter dates styled
- CalendarPopup available for any future date selection needs (dashboard, etc.)

---
*Phase: 02-module-core*
*Completed: 2026-03-21*
