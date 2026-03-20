---
phase: 02-module-core
plan: 05
subsystem: expenses
tags: [sqlite, transactions, repositories, ipc, zustand, wallet, expenses]
dependency_graph:
  requires: [02-01]
  provides: [expense-repo, wallet-repo, expenses-ipc, expenses-store, wallet-ui]
  affects: [02-06]
tech_stack:
  added: []
  patterns:
    - better-sqlite3 db.transaction() for atomic multi-statement operations
    - Optimistic UI update with Zustand rollback on IPC error
    - TDD red-green: write failing tests, implement, confirm green
key_files:
  created:
    - src/main/repositories/WalletRepository.ts
    - src/main/repositories/ExpenseRepository.ts
    - src/main/ipc/expenses.ts
    - src/renderer/expenses/expenses-store.ts
    - src/renderer/expenses/ExpensesView.tsx
    - src/renderer/expenses/WalletPanel.tsx
    - src/renderer/expenses/WalletCard.tsx
    - src/renderer/expenses/BalanceAdjustModal.tsx
    - tests/expense-repository.test.ts
  modified:
    - src/main/ipc/index.ts
    - src/renderer/App.tsx
decisions:
  - "ExpenseRepository.create/update/delete all use db.transaction() for atomic wallet balance changes"
  - "WalletPanel renders ModuleHeader internally via ExpensesView to support the + Log Expense right-slot button"
  - "adjustWalletBalance uses optimistic update pattern (immediate Zustand state, rollback on error)"
  - "seedDefaultCategories checks COUNT(*) and inserts 7 defaults only when table empty"
metrics:
  duration_seconds: 310
  completed_date: "2026-03-21"
  tasks_completed: 2
  files_created: 9
  files_modified: 2
---

# Phase 02 Plan 05: Expense Module Backend + Wallet UI Summary

**One-liner:** SQLite transaction-safe expense + wallet repositories with atomic balance deduction, tested TDD, and a 200px wallet sidebar with set/delta balance adjustment modal.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Expense + wallet repositories + IPC + default categories | a0e974e | ExpenseRepository.ts, WalletRepository.ts, expenses.ts (IPC), expense-repository.test.ts |
| 2 | Wallet panel UI with balance display and adjustment | 903114e | expenses-store.ts, ExpensesView.tsx, WalletPanel.tsx, WalletCard.tsx, BalanceAdjustModal.tsx |

## What Was Built

### Task 1 — Repositories + IPC (TDD)

**WalletRepository** — Full CRUD for wallets:
- `list()`: SELECT id, name, balance ORDER BY name ASC
- `create()`: INSERT with randomUUID(), returns Wallet object
- `update()`: Conditional UPDATE for name field
- `adjustBalance(id, mode, amount)`: 'set' = SET balance = ?; 'delta' = SET balance = balance + ?
- `delete()`: Blocked (returns false) when wallet has linked expenses
- `getTotalBalance()`: COALESCE(SUM(balance), 0)

**ExpenseRepository** — Atomic transaction operations:
- `create()`: `db.transaction()` wraps INSERT + `balance = balance - ?`
- `update()`: `db.transaction()` wraps old deduction reversal + new deduction + UPDATE
- `delete()`: `db.transaction()` wraps DELETE + `balance = balance + ?` (reversal)
- `list()`: Dynamic WHERE clause for startDate/endDate/categoryId filters
- Category CRUD: `listCategories`, `createCategory`, `updateCategory`, `deleteCategory` (blocked when in use)
- `seedDefaultCategories()`: Inserts 7 presets (Food, Transport, Bills, Entertainment, Shopping, Health, Other) when table empty

**IPC + Preload:**
- `registerExpensesHandlers()` registers all 13 IPC channels under `expenses:*`
- Seeds default categories on first app launch
- `src/preload/index.ts` already had expenses bridge from plan 02-01 — no changes needed

**Unit Tests (16 tests, all pass):**
- Atomic deduction: createExpense deducts from wallet
- Reversal: deleteExpense restores wallet balance
- Edit reversal: updateExpense reverses old + applies new
- Cross-wallet: edit moving expense between wallets updates both
- Negative balance: allowed (no SQLite constraint)
- deleteWallet blocked when has expenses
- deleteCategory blocked when has expenses
- seedDefaultCategories: inserts 7 on empty table, skips when populated

### Task 2 — Wallet Panel UI

**expenses-store.ts** (Zustand):
- State: wallets, categories, expenses + loading flags
- `adjustWalletBalance`: optimistic update (immediate Zustand, rollback on IPC error)
- `deleteWallet`: shows toast "Can't delete — this wallet has expenses" on blocked delete
- `loadWallets/loadCategories/loadExpenses`: error-toasted on failure

**WalletCard.tsx** — Compact card (12px vertical padding per UI-SPEC exception):
- Name (body/400), balance via `formatPeso` (body/600/text-secondary)
- Lucide Pencil (14px) + ArrowUpDown (14px) icon buttons; hover text-muted → text-secondary

**WalletPanel.tsx** — 200px fixed sidebar:
- Header: "Wallets" label, "Total Balance" meta, total in heading/600
- Wallet cards with `var(--space-2)` gap
- Empty state: "Create a wallet first" + body text + "Add Wallet" button
- Inline add form: name input + ₱ balance input + Save/Cancel
- "+ Add Wallet" footer button (when wallets exist)

**BalanceAdjustModal.tsx** — Small overlay (300px wide):
- Mode toggle: "Set balance" / "Add / Subtract" — active = accent color
- ₱ prefix + number input; Enter to save, Escape to close
- "Discard" cancel + accent "Save" buttons

**ExpensesView.tsx** — Root component:
- `useEffect` loads wallets and categories on mount
- Layout: WalletPanel (200px) | right placeholder
- ModuleHeader right slot: "+ Log Expense" (disabled when no wallets)
- `adjustingWallet` state drives BalanceAdjustModal render

**App.tsx** — Replaced expenses placeholder with `<ExpensesView />` inside ErrorBoundary.

## Deviations from Plan

**None** — plan executed exactly as written.

Note: `src/preload/index.ts` already had the complete expenses bridge from plan 02-01, so Step 6 of Task 1 was a no-op (file already correct).

## Known Stubs

- `ExpensesView.tsx` right panel area: displays "No expenses logged" text — intentional stub. The full `ExpenseList`, `ExpenseFilterBar`, and `ExpenseContextMenu` components are built in plan 02-06.
- `onEditWallet` in WalletPanel: logs to console — inline edit UI for wallet names is not specified in this plan's scope. Wallet names can be updated via the store's `updateWallet` method but the UI trigger is deferred to plan 02-06 or left for UX refinement.

## Self-Check: PASSED

All created files verified to exist on disk. Both task commits verified in git log:
- a0e974e: feat(02-05): expense and wallet repositories + IPC handlers + default categories
- 903114e: feat(02-05): wallet panel UI with balance display and adjustment
