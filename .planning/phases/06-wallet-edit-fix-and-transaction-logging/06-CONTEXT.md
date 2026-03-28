# Phase 6: Wallet Edit Fix & Transaction Logging - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix the non-functional wallet edit button, add a description field to balance adjustments, and create a transaction history log that records every wallet balance change (manual adjustments and expense deductions).

</domain>

<decisions>
## Implementation Decisions

### Wallet edit flow
- **D-01:** Edit button opens an inline form (same pattern as wallet creation) — replaces the wallet card in-place with editable name + balance fields
- **D-02:** Edit allows changing both name and balance in one form
- **D-03:** If the balance is changed during edit, a description is required (same as balance adjustments)
- **D-04:** The current `onEditWallet` handler in ExpensesView.tsx is a `console.log` stub — this is the root cause of the broken edit button

### Balance adjustment descriptions
- **D-05:** Add a description text field to the BalanceAdjustModal
- **D-06:** Description is optional but visually prominent (nudge pattern — field is clearly visible with helpful placeholder)
- **D-07:** Placeholder text: e.g. "Salary deposit, ATM withdrawal"
- **D-08:** Freeform text input only — no dropdown suggestions

### Transaction history log
- **D-09:** Create a new `wallet_transactions` table via migration to log every balance change
- **D-10:** Each log entry stores: amount (signed), description, date, wallet_id, type (manual_set, manual_delta, expense_deduction, expense_reversal)
- **D-11:** UI: "View history" button on each wallet card opens a modal showing that wallet's transaction log
- **D-12:** Each entry displays: amount (±₱500), description, and date — no type badge or running balance
- **D-13:** Expense deductions (from logging expenses) and expense reversals (from deleting expenses) also appear in the transaction log — full audit trail

### Claude's Discretion
- Transaction log sort order and pagination (most recent first is standard)
- Empty state for transaction log modal
- How many transactions to show by default (all vs recent N)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

### Key source files
- `src/renderer/expenses/ExpensesView.tsx` — Main expenses view, contains the broken onEditWallet stub (line 172-174)
- `src/renderer/expenses/WalletCard.tsx` — Wallet card with edit/adjust buttons
- `src/renderer/expenses/WalletPanel.tsx` — Wallet sidebar panel, inline create form pattern to reuse for edit
- `src/renderer/expenses/BalanceAdjustModal.tsx` — Balance adjust modal, needs description field added
- `src/main/repositories/WalletRepository.ts` — Wallet CRUD, update() only supports name currently
- `src/main/db/migrations.ts` — Migration runner, needs new migration for wallet_transactions table
- `src/main/ipc/expenses.ts` — IPC handlers for expense operations
- `src/shared/ipc-types.ts` — IPC channel type definitions
- `src/shared/domain-types.ts` — Domain type definitions (Wallet, Expense, etc.)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **WalletPanel inline form:** The create wallet form in WalletPanel.tsx (lines 100-196) is the pattern to reuse for the edit form — same fields (name, balance), same inline expandable behavior
- **BalanceAdjustModal:** Already has the modal overlay pattern — just needs a description field added
- **WalletRepository:** Has `update(id, { name })` and `adjustBalance(id, mode, amount)` methods — need to extend both
- **formatPeso():** Shared formatting utility for peso amounts

### Established Patterns
- Inline expandable forms for CRUD (wallet create, habit create/edit)
- Modal overlays for focused actions (expense log, balance adjust)
- Context menu for edit/delete actions
- Optimistic updates via zustand store (expenses-store.ts)
- Design token-based styling (var(--color-*), var(--space-*), etc.)

### Integration Points
- ExpensesView.tsx `onEditWallet` callback needs real implementation
- WalletRepository needs transaction logging on every balance change
- Expense creation/deletion already touches wallet balance — needs to also log transactions
- New IPC channel needed for fetching wallet transactions

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-wallet-edit-fix-and-transaction-logging*
*Context gathered: 2026-03-28*
