---
phase: 3
slug: dashboard-navigation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx vitest run tests/dashboard-ipc.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/dashboard-ipc.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | SHELL-01 | unit | `npx vitest run tests/dashboard-ipc.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | SHELL-01 | unit | `npx vitest run tests/dashboard-ipc.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | SHELL-01 | unit | `npx vitest run tests/dashboard-ipc.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | SHELL-01 | unit | `npx vitest run tests/dashboard-ipc.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | SHELL-01 | manual | N/A | N/A | ⬜ pending |
| 03-02-02 | 02 | 1 | SHELL-02 | manual | N/A | N/A | ⬜ pending |
| 03-03-01 | 03 | 2 | KBD-01 | manual | N/A | N/A | ⬜ pending |
| 03-03-02 | 03 | 2 | KBD-02 | manual | N/A | N/A | ⬜ pending |
| 03-03-03 | 03 | 2 | KBD-03 | manual | N/A | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/dashboard-ipc.test.ts` — covers SHELL-01 data aggregation, overdue count, empty state, spending grouping. Follows pattern of `tests/planner-repository.test.ts`: in-memory SQLite, `@vitest-environment node` directive, schema setup inline.

*Existing infrastructure — vitest.config.ts, tests/setup.ts — covers all other needs. No new framework install required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sidebar active indicator reflects activeModule | SHELL-02 | Visual rendering in Electron renderer | 1. Open app 2. Click each sidebar icon 3. Verify active module has highlighted indicator |
| Tab order reaches dashboard cards | KBD-01 | Focus management in Electron renderer | 1. Open dashboard 2. Press Tab 3. Verify focus ring appears on each interactive card in order |
| Ctrl+K opens palette; selecting action navigates | KBD-02 | Cross-component state + Electron keydown | 1. Press Ctrl+K 2. Type "task" 3. Press Enter 4. Verify planner opens with add input focused |
| `?` overlay shows all Phase 1-3 shortcuts | KBD-03 | Visual rendering of overlay content | 1. Press `?` 2. Verify three sections: Navigation, Module Actions, Global 3. Verify all shortcuts listed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
