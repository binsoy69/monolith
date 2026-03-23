# Debug Session: Expense Analytics Toggle Affordance

## Symptom

The expense analytics section exists, but the user found the collapsed-state button and text hard to notice.

## Root Cause

Analytics are hidden by default behind a very subtle `Show charts` text button. The trigger has low visual weight and the collapsed state provides no preview or summary to signal value.

## Evidence

- `src/renderer/expenses/ExpenseAnalyticsSection.tsx` styles the toggle as small text with `background: none`, `border: none`, and no icon or container.
- `src/renderer/expenses/ExpensesView.tsx` initializes `showAnalytics` to `false`, so the subtle toggle is the only discovery surface.

## Files Involved

- `src/renderer/expenses/ExpenseAnalyticsSection.tsx`
- `src/renderer/expenses/ExpensesView.tsx`

## Fix Direction

Promote the analytics toggle into a clearer CTA and show a visible collapsed-state summary so the feature is discoverable before expansion.
