---
phase: 04-depth-differentiators
plan: 06
subsystem: expenses
tags: [expenses, analytics, ux, renderer-gap-closure]
dependency_graph:
  requires: [04-03]
  provides:
    - visible collapsed analytics CTA
    - preview copy for loaded and loading states
    - accessible expand/collapse state on the analytics surface
  affects: [expenses]
tech_stack:
  added: []
  patterns:
    - Analytics stays collapsed by default while advertising itself through a summary card
    - Expanded analytics content remains inline above the expense list
key_files:
  created:
    - tests/expense-analytics-section.test.tsx
  modified:
    - src/renderer/expenses/ExpenseAnalyticsSection.tsx
    - src/renderer/expenses/ExpensesView.tsx
decisions:
  - "The collapsed state should preview the active month total instead of hiding analytics behind low-emphasis helper text"
requirements-completed: [EXP-04, EXP-05, EXP-10]
metrics:
  completed_date: "2026-03-24"
  tasks_completed: 2
---

# Phase 04 Plan 06: Analytics Affordance Gap Closure

The expense analytics surface is now discoverable before expansion. The old subtle text toggle was replaced by a full-width summary CTA with `aria-expanded`, preview copy, and a month-total summary when analytics is loaded, while still showing visible placeholder text before data arrives.

The existing expanded analytics experience remains intact: monthly header, donut chart, and 3/6/12 month trend controls still render inline above the list, and `showAnalytics` still defaults to `false`. Regression coverage now locks collapsed-state discoverability and accessible expand/collapse behavior.

## Verification

- `npx vitest run tests/expense-analytics-section.test.tsx --pool=threads --maxWorkers=1`
- `npm run build`

## Notes

- The implementation was already present in the working tree when this execution pass resumed; this summary records the verified plan closure.
