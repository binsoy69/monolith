---
phase: 6
slug: wallet-edit-fix-and-transaction-logging
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | Wallet edit fix | unit | `npx vitest run tests/wallet-edit.test.ts` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | Balance adjustment description | unit | `npx vitest run tests/wallet-balance-adjust.test.ts` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 1 | Transaction logging | unit | `npx vitest run tests/wallet-transactions.test.ts` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 1 | Transaction history UI | component | `npx vitest run tests/wallet-transaction-history.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/wallet-edit.test.ts` — stubs for wallet edit fix
- [ ] `tests/wallet-balance-adjust.test.ts` — stubs for description requirement
- [ ] `tests/wallet-transactions.test.ts` — stubs for transaction logging repository
- [ ] `tests/wallet-transaction-history.test.tsx` — stubs for transaction history UI

*Existing vitest infrastructure covers framework requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Wallet edit button opens edit form | Wallet edit fix | Visual interaction | Click edit button on wallet panel, verify form appears |
| Transaction history displays entries | Transaction logging | Visual rendering | Adjust wallet balance, verify transaction appears in history |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
