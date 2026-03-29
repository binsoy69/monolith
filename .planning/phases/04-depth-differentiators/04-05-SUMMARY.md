---
phase: 04-depth-differentiators
plan: 05
subsystem: planner
tags: [planner, ordering, priority, carry-forward, renderer-gap-closure]
dependency_graph:
  requires: [04-02]
  provides:
    - priority-aware planner ordering contract
    - renderer sort parity with repository ordering
    - drag reorder guardrails within carry/priority bands
  affects: [planner]
tech_stack:
  added: []
  patterns:
    - Carried tasks stay above same-day tasks while honoring priority within each bucket
    - Manual reorder remains meaningful only inside a shared carry/priority band
key_files:
  created:
    - tests/task-list-ordering.test.tsx
  modified:
    - src/main/repositories/PlannerRepository.ts
    - src/renderer/planner/TaskList.tsx
    - tests/planner-depth-repository.test.ts
decisions:
  - "Priority is now a real ordering signal, not a decorative badge"
  - "Cross-band drag attempts no-op instead of persisting misleading positions"
requirements-completed: [PLAN-06, PLAN-07, PLAN-08]
metrics:
  completed_date: "2026-03-24"
  tasks_completed: 2
---

# Phase 04 Plan 05: Priority Ordering Gap Closure

Planner ordering now matches the intended contract in both persistence and optimistic UI. Incomplete tasks sort by carry-forward bucket first, then priority (`P1`, `P2`, `P3`, none), then manual `position`, then `createdAt`, while completed tasks still render below incomplete tasks.

`TaskList` mirrors the repository comparator so priority changes take effect immediately without reload, and drag reorder is restricted to tasks inside the same carry/priority band. Regression coverage now locks carry-forward precedence, priority ordering, manual within-band ordering, and overdue-indicator preservation.

## Verification

- `npx vitest run tests/planner-depth-repository.test.ts --pool=threads --maxWorkers=1`
- `npx vitest run tests/task-list-ordering.test.tsx --pool=threads --maxWorkers=1`
- `npm run build`

## Notes

- The implementation was already present in the working tree when this execution pass resumed; this summary records the verified plan closure.
