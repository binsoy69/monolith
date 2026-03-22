---
phase: 4
slug: depth-differentiators
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 4 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run tests/habits-depth-ipc.test.ts tests/planner-depth-repository.test.ts tests/expense-analytics-ipc.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~12 seconds |

---

## Sampling Rate

- **After every task commit:** Run the plan's targeted test command
- **After every plan wave:** Run `npx vitest run`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | HAB-06, HAB-08 | unit | `npx vitest run tests/habits-depth-ipc.test.ts tests/dashboard-ipc.test.ts` | No - W0 | pending |
| 04-01-02 | 01 | 1 | HAB-04, HAB-07 | manual | N/A | N/A | pending |
| 04-02-01 | 02 | 2 | PLAN-07, PLAN-08 | unit | `npx vitest run tests/planner-depth-repository.test.ts tests/dashboard-ipc.test.ts` | No - W0 / dashboard exists | pending |
| 04-02-02 | 02 | 2 | PLAN-06 | manual | N/A | N/A | pending |
| 04-03-01 | 03 | 3 | EXP-04, EXP-05, EXP-10 | unit | `npx vitest run tests/expense-analytics-ipc.test.ts` | No - W0 | pending |
| 04-03-02 | 03 | 3 | EXP-05, EXP-10 | manual | N/A | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `tests/habits-depth-ipc.test.ts` - count-habit completion rules, reorder persistence, history-window payloads
- [ ] `tests/planner-depth-repository.test.ts` - carry-forward transaction behavior, priority persistence, overdue derivation
- [ ] `tests/expense-analytics-ipc.test.ts` - monthly total, category aggregation, zero-filled trend windows

Existing infrastructure covers all framework needs; no new runner setup is required.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dragging a habit reorders only the active incomplete scheduled bucket | HAB-06 | dnd-kit interaction in Electron renderer | 1. Open habits 2. Drag an active habit by its handle 3. Reload 4. Confirm order persists |
| Expanding a habit reveals 7-day / 30-day counts and a 90-day heatmap | HAB-04, HAB-07 | Dense SVG layout and hover affordance | 1. Click a habit row body 2. Confirm counts and heatmap appear inline 3. Hover cells and confirm date/status labels |
| Carried tasks appear at the top of today's list with amber left border | PLAN-07 | App-start behavior plus row rendering | 1. Create incomplete tasks on prior days 2. Restart the app 3. Confirm they appear at top of today's planner list |
| Priority badges render with the right color mapping and remain readable | PLAN-06 | Visual density / contrast check | 1. Set P1, P2, P3 on three tasks 2. Confirm badge copy and colors match the UI-SPEC |
| Expense charts have no visible default Recharts styling | EXP-05, EXP-10 | Visual theming cannot be proven by unit tests alone | 1. Expand charts 2. Confirm tooltip, axes, grid, legend dots, and active states match app tokens |
| Trend toggle changes between 3M / 6M / 12M without layout breakage | EXP-10 | Responsive chart rendering | 1. Toggle 3M, 6M, 12M 2. Confirm labels, points, and totals update without overlap |

---

## Validation Sign-Off

- [ ] All tasks have automated verification or an explicit manual check
- [ ] Sampling continuity: no 3 consecutive tasks without automated verification
- [ ] Wave 0 covers every new repository / IPC surface added in Phase 4
- [ ] No watch-mode commands are used in plans
- [ ] Feedback latency stays below 15 seconds for targeted runs
- [ ] `nyquist_compliant: true` can be set after Wave 0 files exist and pass

**Approval:** pending
