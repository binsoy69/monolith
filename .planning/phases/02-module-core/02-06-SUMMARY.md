---
phase: 02-module-core
plan: 06
subsystem: expenses
tags: [modal, form, zustand, optimistic-ui, category-picker, filter, context-menu, crud]
dependency_graph:
  requires: [02-05]
  provides: [expense-log-modal, category-picker, expense-list, category-management, expense-crud]
  affects: []
tech_stack:
  added: []
  patterns:
    - Optimistic UI: add expense + deduct wallet immediately, rollback on IPC error
    - Controlled form with inline validation (no library)
    - Dropdown built with useRef + mousedown outside-click detection
    - Date formatting via pure JS array lookup (no date-fns to avoid ESM bug)
    - Context menu via shared useContextMenu hook + ContextMenu component
key_files:
  created:
    - src/renderer/expenses/ExpenseLogModal.tsx
    - src/renderer/expenses/CategoryPicker.tsx
    - src/renderer/expenses/InlineCategoryForm.tsx
    - src/renderer/expenses/ExpenseRow.tsx
    - src/renderer/expenses/ExpenseFilterBar.tsx
    - src/renderer/expenses/ExpenseList.tsx
    - src/renderer/expenses/CategoryManageView.tsx
  modified:
    - src/renderer/expenses/expenses-store.ts
    - src/renderer/expenses/ExpensesView.tsx
    - src/renderer/App.tsx
decisions:
  - "ExpenseContextMenu implemented inline in ExpensesView (no separate file) — context items wired directly to showContextMenu call"
  - "Date formatting in ExpenseRow uses pure JS array lookup (no date-fns) — consistent with streak/planner pattern to avoid ESM bug"
  - "CategoryManageView embedded in ExpensesView via toggle button below expense list — avoids adding a new route or modal layer"
  - "newItemTrigger prop passed to ExpensesView to support N key shortcut — consistent with HabitsView pattern"
  - "Delete confirmation implemented as fixed overlay (not inline row swap) — simpler given the flat list layout vs card layout"
metrics:
  duration_seconds: 342
  completed_date: "2026-03-21"
  tasks_completed: 2
  files_created: 7
  files_modified: 3
---

# Phase 02 Plan 06: Expense Module UI Complete Summary

**One-liner:** Full expense CRUD loop — modal form with category picker and inline category creation, chronological expense list with date/category filters, right-click Edit/Delete context menu with optimistic wallet balance deductions and rollbacks, plus category management (rename, recolor, delete-if-unused).

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Expense log modal, category picker, and store methods | 64c7dbc | ExpenseLogModal.tsx, CategoryPicker.tsx, InlineCategoryForm.tsx, expenses-store.ts |
| 2 | Expense list, filter bar, context menu, and category management | e12e827 | ExpenseList.tsx, ExpenseRow.tsx, ExpenseFilterBar.tsx, CategoryManageView.tsx, ExpensesView.tsx |

## What Was Built

### Task 1 — Expense Log Modal + Store Methods

**expenses-store.ts** — New methods added:
- `createExpense`: Optimistic — appends expense with temp ID + deducts from wallet, then IPC. Replaces temp ID with real one on success. Rollback on error.
- `updateExpense`: Optimistic — reverses old wallet deduction, applies new one, updates expense. Rollback on error.
- `deleteExpense`: Optimistic — removes expense + reverses wallet deduction. Rollback on error.
- `createCategory`: IPC call + reloads categories, returns new Category (for auto-select).
- `updateCategory`: IPC call + reloads categories.
- `deleteCategory`: Returns false + toasts "Can't delete -- this category is in use" if blocked.

**CategoryPicker.tsx** — Dropdown component:
- Trigger button shows selected category with 8px color dot + name, or "Select category" placeholder
- Dropdown renders all categories with color dots, hover highlight
- Separator + "+ New Category" button (accent color, small text) at bottom
- Opens InlineCategoryForm when "+ New Category" clicked
- Closes on outside mousedown click

**InlineCategoryForm.tsx** — Inline creation in dropdown:
- Name input (28px height, small text), 12-color preset palette (12px circles)
- Selected color: 2px white outline border
- "Add" button (accent) + "x" cancel button
- Enter key in name input saves if name + color both set

**ExpenseLogModal.tsx** — Full modal form:
- Overlay: fixed, full viewport, `rgba(0,0,0,0.6)` scrim, click-outside closes
- Modal: 400px wide, `var(--color-bg-overlay)` background, `var(--radius-lg)` border radius, `var(--space-6)` padding
- Fields: Amount (₱ prefix, number input), Date (native date picker, defaults to today), Category (CategoryPicker), Wallet (select), Notes (optional textarea, 2 rows)
- Amount converted: `Math.round(parseFloat(value) * 100)` on submit
- Validation: amount > 0, category required, wallet required — error border `var(--color-destructive)` + 11px error text
- Buttons: "Discard" (text-secondary) + "Log Expense" / "Save Changes" (accent bg)
- Edit mode: pre-fills all fields from existing expense

**ExpensesView.tsx** — Modal wiring:
- `showLogModal` and `editingExpense` state
- "+ Log Expense" button click opens modal in create mode
- `newItemTrigger` prop: when incremented and wallets exist, opens modal (N key shortcut)
- `onCreateCategory` prop wired through to CategoryPicker

### Task 2 — Expense List + Filter + Context Menu + Category Management

**ExpenseRow.tsx** — Single expense row (36px height):
- Date: pure JS format `MMM D` (e.g., "Mar 20"), 48px width, small/text-secondary
- Amount: `formatPeso(expense.amount)`, 80px width, body/600/text-primary
- Category: 8px color dot + category name, small/text-secondary, flex 1
- Wallet: small/text-muted, truncated at 80px
- Notes indicator: StickyNote icon (14px, text-muted) when expense.notes is truthy
- Hover: `var(--color-bg-subtle)` background
- onContextMenu wired on the row div

**ExpenseFilterBar.tsx** — Filter row (40px height):
- Two native `<input type="date">` elements with "From" / "To" labels
- Category select with "All categories" default
- "Clear filters" button (only visible when any filter is active)
- Calls `onFiltersChange` on each change; parent reloads expenses via store.setFilters + loadExpenses

**ExpenseList.tsx** — Right panel list:
- Renders ExpenseFilterBar at top, scrollable ExpenseRow list below
- Empty state: "No expenses logged" + "Your expense history will appear here."
- Resolves category and wallet names from prop arrays

**CategoryManageView.tsx** — Category management section:
- List of categories: color dot (click opens 12-color palette popup), inline name edit (click-to-edit, Enter/blur to save), Trash2 delete button
- Delete: calls `onDelete` (returns boolean) — if false, store toasts blocked message; if true, store reloads categories
- Color change: calls `onUpdate` immediately, no confirm needed
- Accessible via "Manage categories" toggle link at bottom of right panel

**ExpensesView.tsx** — Full wiring:
- Loads wallets, categories, expenses on mount; reloads expenses when `filters` state changes
- Context menu on expense right-click: Edit (opens pre-filled modal) + Delete (opens confirmation overlay)
- Delete confirmation: fixed overlay with "Delete this expense? This will reverse the wallet deduction." + "Keep Expense" cancel + "Delete" destructive button
- CategoryManageView toggled by "Manage categories" link below filter bar
- App.tsx receives `newItemTrigger` → passed to ExpensesView

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Design] ExpenseContextMenu implemented inline (no separate file)**
- **Found during:** Task 2
- **Issue:** Plan listed `ExpenseContextMenu.tsx` as a separate file but specified "logic in ExpensesView" — creating a stub file with no logic would be noise
- **Fix:** Context menu items wired directly in ExpensesView via `useContextMenu` hook — matches how other plans handle it
- **Files modified:** ExpensesView.tsx only

**2. [Rule 1 - Date] Pure JS date formatting instead of date-fns**
- **Found during:** Task 2
- **Issue:** Using `format(parseISO(...))` from date-fns triggers ESM packaging bug in vitest node env (documented in STATE.md decisions)
- **Fix:** Pure JS array lookup: `['Jan','Feb',...][month - 1]` — deterministic, no dependency
- **Files modified:** ExpenseRow.tsx

## Known Stubs

None — all plan requirements fully implemented.

## Self-Check: PASSED

Files exist on disk:
- src/renderer/expenses/ExpenseLogModal.tsx: EXISTS
- src/renderer/expenses/CategoryPicker.tsx: EXISTS
- src/renderer/expenses/InlineCategoryForm.tsx: EXISTS
- src/renderer/expenses/ExpenseRow.tsx: EXISTS
- src/renderer/expenses/ExpenseFilterBar.tsx: EXISTS
- src/renderer/expenses/ExpenseList.tsx: EXISTS
- src/renderer/expenses/CategoryManageView.tsx: EXISTS

Commits verified in git log:
- 64c7dbc: feat(02-06): expense log modal, category picker, and store methods
- e12e827: feat(02-06): expense list, filter bar, context menu, and category management

All 37 tests pass (npx vitest run).
