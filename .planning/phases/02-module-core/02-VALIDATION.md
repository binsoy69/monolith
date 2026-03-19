---
phase: 02
slug: module-core
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run tests/[file].test.ts --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/[file].test.ts --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | HAB-02 | unit | `npx vitest run tests/habits-store.test.ts -t "optimistic"` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | HAB-03 | unit | `npx vitest run tests/streaks.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | HAB-05 | unit | `npx vitest run tests/streaks.test.ts -t "scheduled"` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 1 | PLAN-05 | unit | `npx vitest run tests/planner-repository.test.ts -t "reorder"` | ❌ W0 | ⬜ pending |
| 02-05-01 | 05 | 1 | EXP-07 | unit | `npx vitest run tests/expense-repository.test.ts -t "deduction"` | ❌ W0 | ⬜ pending |
| 02-05-02 | 05 | 1 | EXP-07 | unit | `npx vitest run tests/expense-repository.test.ts -t "delete reversal"` | ❌ W0 | ⬜ pending |
| 02-05-03 | 05 | 1 | EXP-07 | unit | `npx vitest run tests/expense-repository.test.ts -t "edit reversal"` | ❌ W0 | ⬜ pending |
| 02-06-01 | 06 | 2 | HAB-01 | unit | `npx vitest run tests/format-peso.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/streaks.test.ts` — covers HAB-03, HAB-05: streak calculation unit tests with timezone edge cases, scheduled-only counting, reset behavior, best streak tracking
- [ ] `tests/habits-store.test.ts` — covers HAB-02: optimistic update applies before IPC, rollback on error
- [ ] `tests/expense-repository.test.ts` — covers EXP-07, EXP-08: wallet deduction atomicity, delete reversal, edit reversal (requires `@vitest-environment node`)
- [ ] `tests/planner-repository.test.ts` — covers PLAN-05: reorder positions persist correctly (requires `@vitest-environment node`)
- [ ] `tests/format-peso.test.ts` — covers display formatting (₱150 vs ₱150.50)

**Setup note:** Repository tests (better-sqlite3) must use `// @vitest-environment node` comment at top of file to bypass jsdom.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Habit card click toggles check-off with animation | HAB-02 | Visual animation + full click target | Click habit card, verify checkbox fills with accent + card highlight; click again, verify reverse |
| Optimistic update feels instantaneous | HAB-02, PLAN-01, EXP-01 | Perceived performance | Perform write op, confirm UI updates before spinner/delay |
| Module isolation — expense error doesn't crash habits | Phase SC-5 | Error boundary behavior | Force error in one module, verify others still render |
| Drag-and-drop task reorder | PLAN-05 | DnD interaction fidelity | Drag task handle, reorder, verify persistence after navigation |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
