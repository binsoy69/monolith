---
phase: 5
slug: cross-module-distribution
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 5 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run tests/tag-context-menu.test.tsx tests/tag-sidebar.test.tsx tests/command-palette-search.test.tsx tests/notification-settings.test.tsx tests/habit-reminder-service.test.ts tests/update-banner.test.tsx` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds excluding native-module rebuild work |

---

## Sampling Rate

- **After every task commit:** run the plan's targeted test command plus `npm run typecheck` when shared IPC or preload contracts changed
- **After every plan wave:** run `npm run typecheck`
- **Before `$gsd-verify-work`:** run the quick Phase 5 suite plus the build smoke check required by `05-04`
- **Max feedback latency:** 20 seconds for normal task-level validation

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | TAG-01 | typecheck + component | `npm run typecheck && npx vitest run tests/tag-context-menu.test.tsx` | No - W0 | pending |
| 05-01-02 | 01 | 1 | TAG-02 | component + manual | `npx vitest run tests/tag-sidebar.test.tsx` | No - W0 | pending |
| 05-02-01 | 02 | 2 | KBD-04 | typecheck + component | `npm run typecheck && npx vitest run tests/command-palette-search.test.tsx` | No - W0 | pending |
| 05-02-02 | 02 | 2 | KBD-04 | manual | N/A | N/A | pending |
| 05-03-01 | 03 | 3 | HAB-09 | unit | `npx vitest run tests/habit-reminder-service.test.ts` | No - W0 | pending |
| 05-03-02 | 03 | 3 | HAB-09 | component | `npx vitest run tests/notification-settings.test.tsx` | No - W0 | pending |
| 05-04-01 | 04 | 4 | Packaging | typecheck | `npm run typecheck` | existing | pending |
| 05-04-02 | 04 | 4 | Packaging | component + manual | `npx vitest run tests/update-banner.test.tsx` | No - W0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `tests/tag-context-menu.test.tsx` - checked submenu rendering, keep-open tag toggles
- [ ] `tests/tag-sidebar.test.tsx` - sidebar tag list and grouped `TagsView`
- [ ] `tests/command-palette-search.test.tsx` - grouped actions/results, keyboard navigation, async search state
- [ ] `tests/habit-reminder-service.test.ts` - reminder schedule guard, once-per-day behavior, click-to-habits callback
- [ ] `tests/notification-settings.test.tsx` - settings toggle and disabled time input behavior
- [ ] `tests/update-banner.test.tsx` - updater status rendering and restart action wiring

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Applying tags from all three module context menus produces one shared sidebar tag entry | TAG-01, TAG-02 | cross-module interaction plus nested context-menu behavior | 1. Create a tag from habits 2. Apply it to a task and an expense 3. Confirm the sidebar shows the same tag once 4. Open `TagsView` and confirm all three item types appear |
| Selecting a task search hit opens planner on the right date and surfaces the matching row | KBD-04 | module routing and row highlight are runtime UX behaviors | 1. Press `Ctrl+K` 2. Search for a task title 3. Press `Enter` 4. Confirm planner opens on that date and the row flashes into view |
| Selecting a daily-note search hit opens the notes tab for the matching date | KBD-04 | requires live store + view coordination | 1. Search for note content 2. Select the result 3. Confirm planner opens on `Notes` for the matching date |
| The daily reminder fires once, not repeatedly, and clicking it opens Habits | HAB-09 | OS notifications and Electron click behavior are runtime-only | 1. Enable reminders 2. Set the reminder time to the next minute 3. Wait for notification 4. Click it and confirm the app focuses Habits 5. Confirm it does not fire again the same day |
| `npm run build:unpack` produces a runnable unpacked app and the updater banner appears only for packaged builds | Packaging | packaging behavior differs from dev mode | 1. Run `npm run build:unpack` 2. Launch the unpacked app 3. Confirm it starts cleanly 4. Verify updater checks only in the packaged app path |
| `npm run build:win` produces an NSIS installer and the installer runs unsigned with expected Windows warning | Packaging | installer behavior is outside the browser/runtime test environment | 1. Run `npm run build:win` 2. Launch `Monolith-Setup-<version>.exe` 3. Confirm the NSIS flow completes and the installed app opens |

---

## Environment Constraint

Repository tests that import `better-sqlite3` currently fail under the local system Node because the native module was built for `NODE_MODULE_VERSION 140` and the current Node runtime expects `115`.

Implications for Phase 5:

- prefer renderer/component tests and pure service tests for automated feedback
- run `npm run typecheck` after every shared contract change
- treat repository-level DB tests as optional follow-up work unless native modules are rebuilt first

---

## Validation Sign-Off

- [ ] All tasks have automated verification or an explicit manual check
- [ ] Sampling continuity: no two consecutive shell-contract tasks land without `npm run typecheck`
- [ ] Wave 0 covers the new shell primitives introduced by Phase 5
- [ ] No watch-mode commands are used in plans
- [ ] Packaging verification includes both a local unpacked build and an installer smoke check
- [ ] `nyquist_compliant: true` can be set once Wave 0 files exist and pass

**Approval:** pending
