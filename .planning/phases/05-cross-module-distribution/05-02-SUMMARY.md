---
phase: 05-cross-module-distribution
plan: 02
subsystem: global-search
tags: [search, command-palette, ipc, navigation, renderer]
dependency_graph:
  requires:
    - 05-01
  provides:
    - normalized multi-table search repository and typed IPC bridge
    - grouped command palette search UI with async result states
    - cross-module result routing with row-level highlight feedback
  affects: [shell, habits, planner, expenses, main-process]
tech_stack:
  added: []
  patterns:
    - Search stays inside the existing Ctrl+K palette so actions and results share one keyboard-nav list
    - Result routing reuses the existing planner and expense Zustand stores instead of introducing a second navigation layer
key_files:
  created:
    - src/main/repositories/SearchRepository.ts
    - src/main/ipc/search.ts
    - tests/command-palette-search.test.tsx
    - tests/search-navigation.test.tsx
  modified:
    - src/shared/ipc-types.ts
    - src/preload/index.ts
    - src/renderer/App.tsx
    - src/renderer/shell/CommandPalette.tsx
    - src/renderer/shared/styles/globals.css
    - src/renderer/habits/HabitsView.tsx
    - src/renderer/habits/HabitCard.tsx
    - src/renderer/planner/PlannerView.tsx
    - src/renderer/planner/TaskList.tsx
    - src/renderer/planner/TaskRow.tsx
    - src/renderer/expenses/ExpensesView.tsx
    - src/renderer/expenses/ExpenseList.tsx
    - src/renderer/expenses/ExpenseRow.tsx
decisions:
  - "Search fan-outs stay as targeted SQL queries with JS-side scoring so the app can rank habits, tasks, expenses, and daily notes without adding an FTS migration"
  - "Matched rows own their own scroll-and-flash behavior for 1500ms so the shell only passes one-shot highlight ids instead of renderer-global animation state"
requirements-completed: [KBD-04]
metrics:
  completed_date: "2026-03-29"
  tasks_completed: 2
---

# Phase 05 Plan 02: Global Search Summary

Phase 5 now has a real global search path behind the existing command palette. The main process adds a normalized `search.query()` bridge backed by targeted habit, task, expense, and daily-note queries with JS-side ranking so the renderer gets one shared `SearchResult` contract instead of module-specific payloads.

The renderer now keeps quick actions and async search results in one grouped palette. Selecting a result routes to the correct module and date context, and matched habit, task, and expense rows scroll into view and flash so the user lands on the exact item instead of a generic list surface.

## Verification

- `npm run typecheck`
- `npx vitest run tests/command-palette-search.test.tsx tests/search-navigation.test.tsx`

## Task Commits

- `d55b386` - normalized search repository and IPC bridge, grouped command palette UI, cross-module routing, destination highlights, and search coverage
