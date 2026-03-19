---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | None yet — Wave 0 creates `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/[relevant-test].test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | SHELL-03 | unit | `npx vitest run tests/design-tokens.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | SHELL-04 | unit | `npx vitest run tests/shell-navigation.test.tsx` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 1 | SHELL-05 | unit | `npx vitest run tests/no-generic-ui.test.tsx` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 1 | SET-01 | unit | `npx vitest run tests/settings-persistence.test.ts` | ❌ W0 | ⬜ pending |
| 01-05-01 | 05 | 1 | IPC bridge | unit | `npx vitest run tests/ipc-types.test.ts` | ❌ W0 | ⬜ pending |
| 01-06-01 | 01 | 1 | Migrations | unit | `npx vitest run tests/migrations.test.ts` | ❌ W0 | ⬜ pending |
| 01-07-01 | 04 | 1 | Keyboard | unit | `npx vitest run tests/keyboard-router.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — project-level Vitest config (jsdom environment for renderer tests)
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- [ ] `tests/design-tokens.test.ts` — covers SHELL-03; validates CSS custom properties are defined
- [ ] `tests/shell-navigation.test.tsx` — covers SHELL-04; validates state-based module switching
- [ ] `tests/no-generic-ui.test.tsx` — covers SHELL-05; validates no MUI/shadcn class patterns
- [ ] `tests/settings-persistence.test.ts` — covers SET-01; validates electron-store round-trip
- [ ] `tests/ipc-types.test.ts` — validates IPC type contract matches preload exposure
- [ ] `tests/migrations.test.ts` — validates migration runner creates all tables with correct schema
- [ ] `tests/keyboard-router.test.tsx` — validates Alt+1-4 and ? shortcut behavior

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| App launches as desktop window | SHELL-03 | Requires Electron runtime | Run `npm run dev`, verify window appears with dark theme |
| IPC bridge operational end-to-end | SHELL-04 | Requires full Electron context | Open DevTools, call `window.api.settings.get()` in console |
| Sub-100ms transitions | SHELL-04 | Performance timing in real environment | Navigate between modules, observe no loading state |
| Frameless window drag | SHELL-03 | OS-level window interaction | Drag title bar region, verify window moves |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
