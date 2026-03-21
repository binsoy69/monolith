---
phase: 02-module-core
plan: 07
subsystem: habits, expenses
tags: [cosmetic, uat-gap-closure, design-tokens, accessibility]
dependency_graph:
  requires: []
  provides: [design-token-legibility, habit-schedule-subtitle, category-creation]
  affects: [globals.css, HabitCard, HabitProgressBar, ArchivedHabitsView, HabitForm, HabitsView, WalletPanel, WalletCard, CategoryManageView, ExpensesView]
tech_stack:
  added: []
  patterns: [inline-form-toggle, formatDaysOfWeek-reuse]
key_files:
  created: []
  modified:
    - src/renderer/shared/styles/globals.css
    - src/renderer/habits/HabitsView.tsx
    - src/renderer/habits/HabitCard.tsx
    - src/renderer/habits/HabitForm.tsx
    - src/renderer/habits/HabitProgressBar.tsx
    - src/renderer/habits/ArchivedHabitsView.tsx
    - src/renderer/expenses/WalletPanel.tsx
    - src/renderer/expenses/WalletCard.tsx
    - src/renderer/expenses/CategoryManageView.tsx
    - src/renderer/expenses/ExpensesView.tsx
decisions:
  - "--font-size-small raised to 12px globally — minimum legible size for small text"
  - "--color-text-muted raised to #7a7a92 — more contrast on dark bg without breaking hierarchy"
  - "HabitCard shows formatDaysOfWeek subtitle inline — reuses same function logic as ArchivedHabitsView"
  - "WalletPanel add form moves inside scrollable list area — form appears near button context not at bottom"
  - "CategoryManageView gets optional onCreate prop — backwards compatible, button only renders when prop present"
metrics:
  duration_minutes: 12
  completed_date: "2026-03-21"
  tasks_completed: 2
  files_modified: 10
requirements_addressed: [HAB-01, HAB-02, HAB-03, HAB-05, EXP-06, EXP-07, EXP-09]
---

# Phase 02 Plan 07: UAT Gap Closure — Cosmetic and UX Fixes Summary

**One-liner:** Raised global font/color tokens for legibility, added habit schedule subtitles, fixed wallet form position, improved icon click targets, and wired category creation in manage view.

## What Was Built

### Task 1: Global Design Tokens + Habits Text Visibility (commit: 6e9a0c4)

- `globals.css`: `--font-size-small` raised from 11px to 12px — all small-text labels are now legible
- `globals.css`: `--color-text-muted` raised from `#5a5a72` to `#7a7a92` — more visible against dark background while still dimmer than secondary
- `HabitsView.tsx`: "Show Archived" and "+ New Habit" header buttons now use `font-size-body` (13px)
- `HabitCard.tsx`: Added `formatDaysOfWeek` helper; name is now wrapped in a column flex div with schedule days subtitle in `color-text-secondary` at `font-size-small`
- `HabitProgressBar.tsx`: Progress text uses `color-text-secondary` instead of `color-text-muted`
- `ArchivedHabitsView.tsx`: Days span uses `font-size-body` and `color-text-secondary`
- `HabitForm.tsx`: Submit button uses `font-size-body`

### Task 2: Wallet, Category, and Expenses Cosmetic Fixes (commit: 24fa137)

- `WalletPanel.tsx`: Add wallet form moved inside the `flex:1, overflowY:auto` scrollable container as first child — users see form immediately near content, not below fold
- `WalletCard.tsx`: Edit and Adjust icons increased from 14px to 16px; buttons get `padding: 4px`, `borderRadius: var(--radius-sm)`, `color-text-secondary` default, and hover background `color-bg-subtle`
- `CategoryManageView.tsx`: Added `onCreate?` prop; `showAddForm` state toggles `InlineCategoryForm`; "+ New Category" button shown when `onCreate` is provided
- `ExpensesView.tsx`: `createCategory` passed as `onCreate` to `CategoryManageView`; "Manage categories" toggle uses `color-text-secondary` (not muted) as default and on mouseleave

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| `--font-size-small` raised to 12px globally | 11px is below legibility threshold at typical monitor distances; single token change fixes all instances |
| `--color-text-muted` raised to `#7a7a92` | Contrast too low at `#5a5a72`; `#7a7a92` still visually subordinate to secondary (`#9494a8`) while readable |
| Schedule days subtitle in HabitCard | UAT issue: active habits didn't show schedule — subtitle provides context without adding clutter |
| WalletPanel form inside scroll container | Form was appearing below fold; placing it first in scroll area ensures it's immediately visible on open |
| CategoryManageView gets optional `onCreate` prop | Backwards-compatible — existing usages without `onCreate` won't show the button; ExpensesView passes `createCategory` |

## Verification

- `npx tsc --noEmit`: Passed (no output = no errors)
- `npm run build`: Passed — built in 3.51s, no errors

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all changes are fully wired functional implementations.

## Self-Check: PASSED

- src/renderer/shared/styles/globals.css: updated (12px, #7a7a92) — verified
- src/renderer/habits/HabitCard.tsx: formatDaysOfWeek added, subtitle rendered — verified
- src/renderer/expenses/CategoryManageView.tsx: onCreate prop + InlineCategoryForm wired — verified
- Commits 6e9a0c4 and 24fa137 exist in git log — verified
