# Phase 6: Wallet Edit Fix & Transaction Logging - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 06-wallet-edit-fix-and-transaction-logging
**Areas discussed:** Wallet edit flow, Balance adjustment descriptions, Transaction history log

---

## Wallet Edit Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Name only | Wallet edit just renames it — balance changes go through the adjust modal | |
| Name + balance | Wallet edit lets you rename AND set a new balance in one form | ✓ |

**User's choice:** Name + balance
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Inline form (Recommended) | Same inline expandable pattern as wallet creation — replaces the wallet card with an editable form in-place | ✓ |
| Modal overlay | A centered modal like the balance adjust modal — separate from the wallet list | |

**User's choice:** Inline form
**Notes:** Consistent with existing create pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, require description | Any balance change — whether from edit form or adjust modal — always needs a reason logged | ✓ |
| No, only adjust modal needs description | Editing the wallet is for setup/correction — only explicit balance adjustments need descriptions | |

**User's choice:** Yes, require description for balance changes in edit form too
**Notes:** None

---

## Balance Adjustment Descriptions

| Option | Description | Selected |
|--------|-------------|----------|
| Required | Every balance change must have a reason — ensures the transaction log is always meaningful | |
| Optional with nudge | Description is optional but the field is prominent — a visual hint encourages filling it in | ✓ |
| Optional, no nudge | Description field exists but is clearly optional — no pressure to fill it | |

**User's choice:** Optional with nudge
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Freeform only (Recommended) | Just a text input with placeholder like "e.g. Salary deposit, ATM withdrawal" — keeps it simple | ✓ |
| Dropdown suggestions | Common reasons as a dropdown (Salary, Refund, Transfer, etc.) with option to type custom | |

**User's choice:** Freeform only
**Notes:** None

---

## Transaction History Log

| Option | Description | Selected |
|--------|-------------|----------|
| Inside wallet card (expandable) | Click a wallet to expand and see its recent transactions inline — keeps it contextual | |
| Separate panel/section | A dedicated transaction log section below or beside the wallet panel — shows all wallets' transactions | |
| Modal on demand | A "View history" button on each wallet opens a modal with that wallet's transaction log | ✓ |

**User's choice:** Modal on demand
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Amount + description + date (Recommended) | Each entry: ±₱500 — "Salary deposit" — Mar 28, 2026. Clean and essential. | ✓ |
| Amount + description + date + type | Also shows the type (Set balance, Add/Subtract, Expense deduction) as a badge/label | |
| Amount + description + date + running balance | Shows the wallet balance after each transaction — like a bank statement | |

**User's choice:** Amount + description + date
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, include expense deductions | Every wallet balance change shows up — manual adjustments AND automatic expense deductions. Full audit trail. | ✓ |
| No, manual adjustments only | Transaction log only shows explicit balance adjustments, not expense-related deductions | |

**User's choice:** Yes, include expense deductions — full audit trail
**Notes:** None

---

## Claude's Discretion

- Transaction log sort order and pagination
- Empty state for transaction log modal
- How many transactions to show by default

## Deferred Ideas

None — discussion stayed within phase scope
