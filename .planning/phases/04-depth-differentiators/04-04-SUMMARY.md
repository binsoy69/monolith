---
phase: 04-depth-differentiators
plan: 04
subsystem: habits
tags: [habits, count-entry, ipc, zustand, renderer-gap-closure]
dependency_graph:
  requires: [04-01]
  provides:
    - exact count-entry mutation for count habits
    - expanded in-place count editor for large measured values
    - renderer validation for blank and negative submissions
  affects: [habits, preload, shared-types]
tech_stack:
  added: []
  patterns:
    - Direct count entry stays inside the existing expanded habit detail area
    - Collapsed fraction pill remains the primary quick-increment surface
key_files:
  created:
    - src/renderer/habits/HabitCountEditor.tsx
    - tests/habit-count-entry-ui.test.tsx
  modified:
    - src/main/ipc/habits.ts
    - src/main/repositories/HabitRepository.ts
    - src/preload/index.ts
    - src/renderer/habits/HabitsView.tsx
    - src/renderer/habits/habits-store.ts
    - src/shared/ipc-types.ts
    - tests/habits-depth-ipc.test.ts
decisions:
  - "Count habits now support exact setCount mutations without replacing increment/reset semantics"
  - "Raw measured values above the target are preserved instead of clamped"
requirements-completed: [HAB-08]
metrics:
  completed_date: "2026-03-24"
  tasks_completed: 2
---

# Phase 04 Plan 04: Count Entry Gap Closure

Exact count entry for count habits is now wired end to end. The renderer exposes a compact expanded-detail editor, the store performs optimistic `setCount` updates, and the main-process pipeline persists arbitrary non-negative integers while still treating completion as `value >= targetCount`.

The collapsed row interaction remains unchanged: the inline fraction pill still handles quick increments, and manual entry lives only in the expanded detail area. Regression coverage now locks the large-value case (`1000`), below-target incomplete behavior, above-target completion behavior, and blank/negative renderer validation.

## Verification

- `npx vitest run tests/habits-depth-ipc.test.ts --pool=threads --maxWorkers=1`
- `npx vitest run tests/habit-count-entry-ui.test.tsx --pool=threads --maxWorkers=1`
- `npm run build`

## Notes

- The implementation was already present in the working tree when this execution pass resumed; this summary records the verified plan closure.
