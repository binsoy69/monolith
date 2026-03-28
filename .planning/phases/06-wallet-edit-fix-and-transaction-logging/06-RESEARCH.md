# Phase 6: Wallet Edit Fix & Transaction Logging - Research

**Researched:** 2026-03-28
**Domain:** Electron/React desktop app — SQLite migration, Zustand state, inline form UI, IPC extension
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Wallet edit flow**
- D-01: Edit button opens an inline form (same pattern as wallet creation) — replaces the wallet card in-place with editable name + balance fields
- D-02: Edit allows changing both name and balance in one form
- D-03: If the balance is changed during edit, a description is required (same as balance adjustments)
- D-04: The current `onEditWallet` handler in ExpensesView.tsx is a `console.log` stub — this is the root cause of the broken edit button

**Balance adjustment descriptions**
- D-05: Add a description text field to the BalanceAdjustModal
- D-06: Description is optional but visually prominent (nudge pattern — field is clearly visible with helpful placeholder)
- D-07: Placeholder text: e.g. "Salary deposit, ATM withdrawal"
- D-08: Freeform text input only — no dropdown suggestions

**Transaction history log**
- D-09: Create a new `wallet_transactions` table via migration to log every balance change
- D-10: Each log entry stores: amount (signed), description, date, wallet_id, type (manual_set, manual_delta, expense_deduction, expense_reversal)
- D-11: UI: "View history" button on each wallet card opens a modal showing that wallet's transaction log
- D-12: Each entry displays: amount (±₱500), description, and date — no type badge or running balance
- D-13: Expense deductions (from logging expenses) and expense reversals (from deleting expenses) also appear in the transaction log — full audit trail

### Claude's Discretion
- Transaction log sort order and pagination (most recent first is standard)
- Empty state for transaction log modal
- How many transactions to show by default (all vs recent N)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

## Summary

Phase 6 is a focused bug fix and feature addition to the expenses module. All work is contained within three areas: (1) fixing the broken wallet edit button by implementing a real `onEditWallet` handler and extending `WalletRepository.update()` to accept balance, (2) adding a description field to `BalanceAdjustModal`, and (3) creating a `wallet_transactions` table to log all balance changes with a UI modal to view history.

The codebase is well-understood. Patterns are fully established in Phases 1-4. No new libraries are needed. Every change layers onto existing conventions: inline forms from WalletPanel, modal overlays from BalanceAdjustModal, SQLite migrations from migrations.ts, IPC handler registration from expenses.ts, and Zustand store methods from expenses-store.ts.

The one environment constraint to be aware of: `better-sqlite3` native tests fail under the system Node.js (v20) due to NODE_MODULE_VERSION mismatch with Electron's bundled Node. Repository tests must be skipped or worked around. React component tests (jsdom environment) run cleanly.

**Primary recommendation:** Implement the phase in four plan-sized chunks: (1) DB migration + WalletTransactionRepository, (2) WalletRepository + ExpenseRepository transaction logging, (3) IPC + preload + store layer, (4) UI — wallet edit inline form + BalanceAdjustModal description + WalletHistoryModal.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| better-sqlite3 | ^12.8.0 | SQLite queries and transactions | Already in use — all DB work uses this |
| React | ^19.2.1 | UI components | App framework |
| Zustand | ^5.0.12 | Client state management | Already used for expenses-store |
| lucide-react | ^0.577.0 | Icons (Pencil, Clock, ArrowUpDown) | Already used in WalletCard |

### No New Dependencies Required
All needed functionality is covered by the existing stack. The `wallet_transactions` table is pure SQLite. The history modal reuses the existing modal overlay pattern. No date library is needed — ISO date strings and `Date` constructor cover all formatting (avoiding the date-fns ESM bug documented in project decisions).

**Installation:** None required — no new packages.

---

## Architecture Patterns

### Recommended Project Structure Changes

```
src/
├── main/
│   ├── db/
│   │   └── migrations.ts              # Add version 4: wallet_transactions table
│   ├── repositories/
│   │   ├── WalletRepository.ts        # Extend update() + adjustBalance() to log transactions
│   │   ├── WalletTransactionRepository.ts  # NEW: CRUD for wallet_transactions
│   │   └── ExpenseRepository.ts       # Extend create/update/delete to log transactions
│   └── ipc/
│       └── expenses.ts                # Register new expenses:listWalletTransactions handler
├── renderer/
│   └── expenses/
│       ├── WalletCard.tsx             # Add "View history" button
│       ├── WalletPanel.tsx            # Add editingWalletId state + inline edit form
│       ├── BalanceAdjustModal.tsx     # Add description field
│       ├── WalletHistoryModal.tsx     # NEW: transaction history modal
│       └── expenses-store.ts         # Add updateWalletWithBalance(), fetchWalletTransactions()
└── shared/
    ├── domain-types.ts                # Add WalletTransaction interface
    └── ipc-types.ts                   # Extend ExpensesAPI with listWalletTransactions()
                                       # Extend updateWallet to accept balance
```

### Pattern 1: SQLite Migration (append-only)
**What:** Add migration version 4 to `migrations.ts` — the migration runner uses `user_version` pragma and runs each version once.
**When to use:** Any new table or schema change.
**Example:**
```typescript
// Source: src/main/db/migrations.ts (existing pattern)
{
  version: 4,
  sql: `
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY,
      wallet_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (wallet_id) REFERENCES wallets(id)
    );
    CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id
      ON wallet_transactions(wallet_id);
  `
}
```

### Pattern 2: Transaction Logging in Repository Methods
**What:** Wrap every wallet balance mutation in a `db.transaction()` that also inserts into `wallet_transactions`. The existing `ExpenseRepository.create/update/delete` already uses `db.transaction()` — add the insert there.
**When to use:** Any method that mutates `wallets.balance`.

The four callers that need transaction inserts:
1. `WalletRepository.adjustBalance()` — type: `manual_set` or `manual_delta`
2. `WalletRepository.update()` (extended) — when balance changes, type: `manual_set`
3. `ExpenseRepository.create()` — type: `expense_deduction`
4. `ExpenseRepository.delete()` — type: `expense_reversal`

Note: `ExpenseRepository.update()` reverses old and applies new — logs two entries: one `expense_reversal` for the old amount and one `expense_deduction` for the new amount. Or alternatively, log only a net delta entry of type `expense_deduction`. Decision left to Claude's discretion — the simpler approach is a single net entry.

**Injection pattern:** `WalletRepository` and `WalletTransactionRepository` both receive the same `db` instance. `WalletRepository` can either:
- Accept `WalletTransactionRepository` as a constructor dependency, or
- Inline the INSERT into `wallet_transactions` directly (simpler, avoids circular deps)

Recommendation: Inline the INSERT directly — this phase doesn't need a full repository abstraction for the log insert.

### Pattern 3: Inline Edit Form (reuse WalletPanel create pattern)
**What:** WalletPanel manages `editingWalletId: string | null` state. When set, the matching `WalletCard` is replaced by an inline edit form identical to the create form (name input + balance input).
**When to use:** Per D-01/D-02.

```typescript
// WalletPanel state addition
const [editingWalletId, setEditingWalletId] = useState<string | null>(null)
const [editName, setEditName] = useState('')
const [editBalance, setEditBalance] = useState('')

// In wallet map render
wallets.map((wallet) =>
  editingWalletId === wallet.id ? (
    <WalletEditForm
      wallet={wallet}
      name={editName}
      balance={editBalance}
      onNameChange={setEditName}
      onBalanceChange={setEditBalance}
      onSave={handleEditSave}
      onCancel={() => setEditingWalletId(null)}
    />
  ) : (
    <WalletCard
      key={wallet.id}
      wallet={wallet}
      onEdit={() => {
        setEditingWalletId(wallet.id)
        setEditName(wallet.name)
        setEditBalance(String(wallet.balance / 100))
      }}
      onAdjust={() => onAdjustBalance(wallet)}
      onViewHistory={() => setHistoryWalletId(wallet.id)}
    />
  )
)
```

**D-03 implementation:** In `handleEditSave`, compare new balance (in cents) to `wallet.balance`. If different, require non-empty description before calling IPC. The description flows as part of the `updateWalletWithBalance` call so the repository can log it.

### Pattern 4: IPC Extension
**What:** New IPC channel `expenses:listWalletTransactions` + extend `expenses:updateWallet` to accept optional `balance` and `description`.
**When to use:** Consistent with established pattern in `src/main/ipc/expenses.ts`.

`ipc-types.ts` changes:
```typescript
// Extend ExpensesAPI
updateWallet: (data: { id: string; name?: string; balance?: number; description?: string }) => Promise<void>
listWalletTransactions: (walletId: string) => Promise<WalletTransaction[]>
```

`domain-types.ts` addition:
```typescript
export type WalletTransactionType = 'manual_set' | 'manual_delta' | 'expense_deduction' | 'expense_reversal'

export interface WalletTransaction {
  id: string
  walletId: string
  amount: number      // signed integer cents — positive = credit, negative = debit
  type: WalletTransactionType
  description: string | null
  date: string        // ISO date YYYY-MM-DD
  createdAt: string
}
```

### Pattern 5: adjustWalletBalance description threading
**What:** `BalanceAdjustModal.onSave` currently passes `(mode, amount)`. Extend signature to `(mode, amount, description?: string)`.
**Chain:** BalanceAdjustModal → ExpensesView.handleAdjustSave → expenses-store.adjustWalletBalance → IPC → WalletRepository.adjustBalance.

Each layer needs the description field threaded through. The description is stored in `wallet_transactions` only — it does NOT go in the `wallets` table.

### Pattern 6: WalletHistoryModal
**What:** A modal overlay (same pattern as BalanceAdjustModal) triggered by "View history" button on WalletCard.
**Data:** Fetched on open via `window.api.expenses.listWalletTransactions(walletId)`.
**No store caching needed** — transaction history is read-only display, fetched fresh each open.

```typescript
// In ExpensesView or WalletPanel: historyWalletId state
const [historyWalletId, setHistoryWalletId] = useState<string | null>(null)

{historyWalletId && (
  <WalletHistoryModal
    wallet={wallets.find(w => w.id === historyWalletId)!}
    onClose={() => setHistoryWalletId(null)}
  />
)}
```

`WalletHistoryModal` fetches its own data via `useEffect` on mount — keeps concerns separate, no store pollution.

### Anti-Patterns to Avoid
- **Storing description in the wallets table:** The description belongs to the transaction record, not the wallet. Do not add a `description` column to `wallets`.
- **Running expense logging outside transactions:** All balance mutations + transaction inserts MUST be in a single `db.transaction()`. If the log insert fails, the balance change must also roll back.
- **Forwarding `onEditWallet(id)` and expecting WalletPanel to own edit state:** With D-01 (inline edit), WalletPanel must own `editingWalletId` state locally. ExpensesView only needs to pass the save/update callback, not manage which wallet is being edited.
- **Calling `loadWallets()` from ExpensesView after every balance change:** The store's `updateWallet` already calls `loadWallets()` after success. Double-loading on successful edit is harmless but redundant.
- **Using date-fns for date formatting:** Project decision from Phase 2 — use pure JS array lookups or `Intl.DateTimeFormat` to avoid the date-fns ESM packaging bug in vitest.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal overlay | Custom modal system | Inline JSX with `position: fixed; inset: 0` | BalanceAdjustModal already does this cleanly |
| DB migrations | Custom version tracking | Existing `user_version` pragma runner in connection.ts | Already handles sequential version runs |
| Transaction atomicity | Manual error recovery | `db.transaction()` from better-sqlite3 | Atomic commit/rollback built in |
| Amount formatting | Custom formatter | `formatPeso()` from `src/shared/format.ts` | Already handles cent-to-peso, strips trailing zeros |
| Signed amount display | Custom sign logic | Inline: `amount > 0 ? '+' : ''` + formatPeso | Simple enough to inline |

---

## Runtime State Inventory

> Included because this phase adds a new table and extends existing IPC contracts — not a rename/refactor, but DB migration state is relevant.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `wallets` table — existing rows have no transaction history | No backfill needed — transaction log starts from Phase 6 deployment forward |
| Stored data | No `wallet_transactions` table exists yet | Created by migration version 4 |
| Live service config | None — local SQLite only, no external services | None |
| OS-registered state | None | None |
| Secrets/env vars | None relevant | None |
| Build artifacts | None — no compiled binaries affected | None |

**Migration safety:** Migration version 4 uses `CREATE TABLE IF NOT EXISTS` — idempotent and safe to re-run. The migration runner will only execute it once (user_version tracks state).

---

## Common Pitfalls

### Pitfall 1: WalletRepository has no access to WalletTransactionRepository
**What goes wrong:** `WalletRepository.adjustBalance()` needs to insert into `wallet_transactions`, but the current class only knows about the `wallets` table.
**Why it happens:** Repository classes are instantiated independently in `expenses.ts`.
**How to avoid:** Either (a) inline the `wallet_transactions` INSERT directly inside `WalletRepository` methods without creating a separate repository class, or (b) pass a `WalletTransactionRepository` instance into `WalletRepository` constructor. Option (a) is simpler and consistent with the codebase style (repositories are lightweight, not DI-heavy).
**Warning signs:** If the transaction log is missing entries after manual adjustments, the INSERT is likely in the wrong place.

### Pitfall 2: ExpenseRepository.update() logs two transactions instead of one (or vice versa)
**What goes wrong:** `update()` reverses old deduction then applies new — should this log two transactions (reversal + deduction) or one net delta?
**Why it happens:** Ambiguity in what "full audit trail" means for edits.
**How to avoid:** Log two entries: one `expense_reversal` for the old amount (positive, since it restores balance), one `expense_deduction` for the new amount (negative). This matches the description in D-13 ("expense reversals"). If the decision is made to log only one net entry, document it clearly.
**Warning signs:** History modal showing double entries for simple expense edits.

### Pitfall 3: Description required gate on wallet edit (D-03)
**What goes wrong:** User changes only the name, not the balance — incorrectly blocked by a description requirement.
**Why it happens:** Validation logic checks "is description empty" without first checking "did balance actually change."
**How to avoid:** Compare `newBalanceCents !== wallet.balance` before requiring description. If they're equal, no description required even if the field is empty.
**Warning signs:** Users unable to rename wallets without entering a description.

### Pitfall 4: onEditWallet prop chain — WalletPanel vs ExpensesView ownership
**What goes wrong:** Currently `onEditWallet: (id: string) => void` is passed from ExpensesView to WalletPanel to WalletCard. With inline edit (D-01), the editing state lives in WalletPanel. The prop is no longer needed.
**Why it happens:** The stub prop `console.log('Edit wallet', id)` was a placeholder for a different implementation.
**How to avoid:** Remove `onEditWallet` from `WalletPanelProps` entirely (or make it internal). ExpensesView passes `onUpdateWallet` (the IPC-calling function) down instead. WalletPanel manages edit open/close state locally.
**Warning signs:** TypeScript errors on `WalletPanelProps` if `onEditWallet` is called from inside WalletPanel while also being passed from outside.

### Pitfall 5: better-sqlite3 native module version mismatch in tests
**What goes wrong:** `npx vitest run tests/expense-repository.test.ts` fails with `ERR_DLOPEN_FAILED` — "compiled against NODE_MODULE_VERSION 140, requires 115."
**Why it happens:** System Node.js is v20 (NODE_MODULE_VERSION 115) but better-sqlite3 was installed/compiled against Electron's bundled Node.js (NODE_MODULE_VERSION 140). This is a known environment constraint.
**How to avoid:** Repository-layer tests (`.test.ts` with `// @vitest-environment node`) will fail until `npm rebuild` is run under the Electron Node version. For this phase, write React component tests (`.test.tsx`, jsdom environment) for UI behavior and accept that new repository tests will show the same mismatch failure.
**Warning signs:** `ERR_DLOPEN_FAILED` in vitest output for any file that imports better-sqlite3.

---

## Code Examples

Verified patterns from the actual codebase:

### Transaction logging insert (inline in WalletRepository)
```typescript
// Pattern: inline INSERT alongside wallet balance UPDATE, inside db.transaction()
adjustBalance(id: string, mode: 'set' | 'delta', amount: number, description?: string): void {
  const now = new Date().toISOString()
  const today = now.slice(0, 10) // YYYY-MM-DD
  const txId = randomUUID()
  const type = mode === 'set' ? 'manual_set' : 'manual_delta'

  const tx = this.db.transaction(() => {
    if (mode === 'set') {
      this.db.prepare('UPDATE wallets SET balance = ? WHERE id = ?').run(amount, id)
    } else {
      this.db.prepare('UPDATE wallets SET balance = balance + ? WHERE id = ?').run(amount, id)
    }
    this.db
      .prepare(
        'INSERT INTO wallet_transactions (id, wallet_id, amount, type, description, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .run(txId, id, amount, type, description ?? null, today, now)
  })
  tx()
}
```

### Signed amount display in WalletHistoryModal
```typescript
// Pure JS — no date-fns, consistent with project decisions
function formatSignedAmount(amount: number): string {
  const prefix = amount > 0 ? '+' : ''
  return prefix + formatPeso(Math.abs(amount))
}
```

### WalletHistoryModal fetch pattern
```typescript
// Self-contained data fetching — no store involvement
function WalletHistoryModal({ wallet, onClose }: WalletHistoryModalProps) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.api.expenses.listWalletTransactions(wallet.id)
      .then(txns => {
        setTransactions(txns) // most recent first — sorted in SQL
        setLoading(false)
      })
  }, [wallet.id])
  // ...
}
```

### WalletTransactionRepository.listForWallet
```typescript
listForWallet(walletId: string): WalletTransaction[] {
  const rows = this.db
    .prepare(
      `SELECT id, wallet_id as walletId, amount, type, description, date, created_at as createdAt
       FROM wallet_transactions
       WHERE wallet_id = ?
       ORDER BY created_at DESC`
    )
    .all(walletId) as WalletTransaction[]
  return rows
}
```

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build / test runner | ✓ | v20.19.5 | — |
| better-sqlite3 | Repository tests (node env) | Partially | Installed but NODE_MODULE_VERSION mismatch | Skip node-env tests; jsdom tests work fine |
| vitest | Test runner | ✓ | v4.1.0 | — |
| @testing-library/react | React component tests | ✓ | ^16.3.2 | — |

**Missing dependencies with no fallback:** None that block implementation.

**better-sqlite3 test caveat:** New repository tests for `WalletTransactionRepository` and extended `WalletRepository` will fail under system Node.js due to native module VERSION mismatch. This is pre-existing — not a Phase 6 regression. Write tests anyway (they document contracts); note they will pass when run inside Electron's Node context.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest v4.1.0 |
| Config file | vitest.config.ts (project root) |
| Quick run command | `npx vitest run tests/wallet-transaction-repository.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Behavior | Test Type | Automated Command | File |
|----------|-----------|-------------------|------|
| WalletTransactionRepository.listForWallet returns rows sorted desc | unit (node) | `npx vitest run tests/wallet-transaction-repository.test.ts` | Wave 0 |
| WalletRepository.adjustBalance logs transaction entry | unit (node) | `npx vitest run tests/wallet-transaction-repository.test.ts` | Wave 0 |
| WalletEditForm shows description field only when balance changes | component | `npx vitest run tests/wallet-edit-inline.test.tsx` | Wave 0 |
| BalanceAdjustModal renders description field | component | `npx vitest run tests/balance-adjust-modal-description.test.tsx` | Wave 0 |
| WalletHistoryModal renders empty state when no transactions | component | `npx vitest run tests/wallet-history-modal.test.tsx` | Wave 0 |
| WalletHistoryModal renders transaction list | component | `npx vitest run tests/wallet-history-modal.test.tsx` | Wave 0 |

**Note on node-environment tests:** Tests importing `better-sqlite3` directly will fail with `ERR_DLOPEN_FAILED` under system Node.js v20. Write them for documentation/contract value and mark as known-failing.

### Sampling Rate
- **Per task commit:** `npx vitest run tests/[relevant-new-test-file]`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green (except pre-existing better-sqlite3 native failures) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/wallet-transaction-repository.test.ts` — covers repository CRUD + logging on balance mutations
- [ ] `tests/wallet-edit-inline.test.tsx` — covers inline edit form behavior (description required when balance changes)
- [ ] `tests/balance-adjust-modal-description.test.tsx` — covers description field rendering in modal
- [ ] `tests/wallet-history-modal.test.tsx` — covers modal open/close, empty state, list rendering

---

## Sources

### Primary (HIGH confidence)
- Direct codebase reading — all findings verified against actual source files
  - `src/renderer/expenses/ExpensesView.tsx` — confirmed `onEditWallet` stub at lines 172-174
  - `src/main/repositories/WalletRepository.ts` — confirmed `update()` only accepts `name`
  - `src/main/db/migrations.ts` — confirmed current schema at version 3
  - `src/main/ipc/expenses.ts` — confirmed IPC handler registration pattern
  - `src/shared/ipc-types.ts` — confirmed `ExpensesAPI` contract
  - `src/renderer/expenses/WalletPanel.tsx` — confirmed inline create form pattern (lines 100-196)
  - `src/renderer/expenses/BalanceAdjustModal.tsx` — confirmed modal pattern
  - `src/renderer/expenses/expenses-store.ts` — confirmed Zustand store patterns
  - `tests/expense-repository.test.ts` — confirmed test structure and `createTestDb()` pattern
  - `vitest.config.ts` — confirmed jsdom default, node override via `// @vitest-environment node`

### Secondary (MEDIUM confidence)
- vitest run output — confirmed better-sqlite3 native module failure (ERR_DLOPEN_FAILED) and jsdom tests passing

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from package.json and existing code, no new libraries needed
- Architecture patterns: HIGH — derived directly from existing codebase patterns
- Pitfalls: HIGH — identified from actual code (stub in ExpensesView.tsx, version mismatch in test output)
- Test infrastructure: HIGH — verified by running vitest

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable stack, no fast-moving dependencies)
