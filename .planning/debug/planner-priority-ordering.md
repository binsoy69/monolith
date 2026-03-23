# Debug Session: Planner Priority Ordering

## Symptom

Setting P1/P2/P3 adds a visible badge, but higher-priority tasks do not rise to the top of the task list.

## Root Cause

Priority is persisted as data and displayed in the row, but ordering ignores it. Both the repository and renderer sort by completion, manual position, and creation time only.

## Evidence

- `src/main/repositories/PlannerRepository.ts` orders `listForDate()` with `ORDER BY completed ASC, position ASC, created_at ASC`.
- `src/renderer/planner/TaskList.tsx` sorts incomplete tasks with `position` then `createdAt`.
- `src/renderer/planner/PlannerView.tsx` updates `priority`, but no reorder logic is triggered after the mutation.

## Files Involved

- `src/main/repositories/PlannerRepository.ts`
- `src/renderer/planner/TaskList.tsx`
- `src/renderer/planner/PlannerView.tsx`

## Fix Direction

Define the intended relationship between priority, carry-forward, and manual drag ordering, then make the list order reflect that contract end to end.
