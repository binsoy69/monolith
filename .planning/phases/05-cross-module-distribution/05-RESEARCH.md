# Phase 5: Cross-Module + Distribution - Research

**Researched:** 2026-03-29
**Domain:** Electron + React desktop app - shared tags, global command-palette search, daily notifications, Windows packaging + auto-update
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Tag system**
- D-01: Tags are a shared global pool across habits, tasks, and expenses.
- D-02: Tags are applied from a context-menu `Tags` submenu with checkboxes plus a `New tag` entry.
- D-03: The sidebar gets a dedicated `Tags` section below the module buttons.
- D-04: Tag colors are auto-assigned from a fixed palette in creation order. No user color picker.

**Global search**
- D-05: Extend the existing `Ctrl+K` command palette instead of adding a second search surface.
- D-06: Search must include daily notes and show a snippet plus date for note hits.
- D-07: Selecting a result navigates directly to the related module/date and closes the palette.

**Notifications**
- D-08: Fire a single count-summary notification: `N habits unchecked today`.
- D-09: Fire once per day at the configured `notificationTime`. No repeat or snooze.
- D-10: Add an explicit `notificationsEnabled` toggle in Settings and keep it off by default.

**Packaging and distribution**
- D-11: Windows-only for v1, packaged as an NSIS installer via `electron-builder`.
- D-12: Auto-update checks GitHub Releases on startup via `electron-updater`.
- D-13: Skip code signing for v1. Shipping unsigned is acceptable even though SmartScreen will warn.

### Resolved Planning Assumptions

- A-01: `ROADMAP.md` still says "signed distributable binary", but the locked phase context explicitly chooses an unsigned Windows installer for v1. Plans should wire packaging and updater behavior while documenting code signing as an external follow-up, not a coding blocker.
- A-02: `src/renderer/shared/ContextMenu.tsx` only supports a flat menu today. Tag assignment therefore has to start by extending the shared menu primitive with checked submenu items before any module can expose tags consistently.
- A-03: Phase 5 should use normalized per-table search queries plus JS-side scoring and result shaping, not an FTS shadow table. The dataset is local and modest, and avoiding trigger maintenance keeps the phase safer.
- A-04: Notification clicks and updater status both need main-to-renderer events. A single shell event bridge should be introduced once and reused.
- A-05: No `05-UI-SPEC.md` exists. Plans should treat `05-CONTEXT.md`, `03-UI-SPEC.md`, `CommandPalette.tsx`, `Sidebar.tsx`, and the existing shell tokens as the visual contract for Phase 5.

### Deferred Ideas

- `tag:<name>` search syntax in the palette
- repeat or snooze notification windows
- Windows code-signing certificate procurement and SmartScreen reputation work

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TAG-01 | User can create and apply tags across all modules | Global `tags` + `item_tags` tables, shared `TagsAPI`, context-menu submenu integration in habits/planner/expenses |
| TAG-02 | User can filter/view by tag across modules | Sidebar tag list plus a dedicated `TagsView` module that renders grouped tagged items |
| KBD-04 | Global search across habits, tasks, expenses, and notes | Extend `Ctrl+K` with async search results, grouped sections, keyboard nav, and module/date routing |
| HAB-09 | User receives desktop notifications for unchecked habits | Main-process scheduler, `notificationsEnabled` setting, one-per-day guard, click-to-habits navigation |

</phase_requirements>

---

## Summary

Phase 5 should stay in four sequential waves that mirror the roadmap plans. Even though tags, search, notifications, and packaging feel conceptually separate, they all touch the same shell-level surfaces: `App.tsx`, `src/shared/ipc-types.ts`, `src/preload/index.ts`, and `src/main/index.ts`. Sequential plans keep those shared contracts stable and prevent later plans from building on half-finished shell behavior.

The highest-leverage discovery is that two cross-cutting primitives need to be established early:

1. The shared context-menu component must support checked submenus so tags can be applied consistently from all three modules.
2. The shell needs a main-to-renderer event bridge so notification clicks and updater status can both drive renderer behavior safely.

The rest of the phase layers naturally onto those primitives:

- tags add the new cross-module data model and sidebar-driven browsing surface
- search extends the already-shipped command palette instead of adding a new route or shortcut
- notifications reuse the settings store and habits repository with one new scheduler service
- packaging mostly reuses existing assets because `electron-builder`, installer scripts, and Windows icons are already present

The only new package the phase genuinely needs is `electron-updater`. `electron-builder` is already installed, build icons already exist in `build/`, and the Git remote already points at `https://github.com/binsoy69/monolith`, which means publish metadata can be concrete instead of placeholder text.

One environment caveat matters for validation: repository tests that import `better-sqlite3` fail under the current system Node with `NODE_MODULE_VERSION 140` vs `115`. Phase 5 planning should therefore lean on `npm run typecheck`, renderer/component tests, and pure service tests unless native modules are rebuilt for the local Node runtime.

**Recommended wave structure**

1. `05-01` Tags foundation and shell route
2. `05-02` Global search inside the existing command palette
3. `05-03` Desktop notifications and shell navigation events
4. `05-04` Windows packaging, updater wiring, and release checklist

---

## Standard Stack

### Existing stack already in the repo

| Library | Current Use | Phase 5 Role |
|---------|-------------|--------------|
| `better-sqlite3` | all repositories and migrations | `tags` / `item_tags` persistence and search queries |
| `electron-store` | settings persistence | `notificationsEnabled`, `notificationTime`, and internal last-sent reminder state |
| `zustand` | per-module stores | tags view state and optional tag caching |
| `lucide-react` | shell and module icons | sidebar tag affordances, menu cues, updater banner iconography |
| `electron-builder` | already installed in `package.json` | NSIS packaging for Windows |

### New dependency required

| Package | Why it is needed | Recommendation |
|---------|------------------|----------------|
| `electron-updater` | GitHub Releases update checks and install flow | add during `05-04` and initialize only in packaged builds |

### Keep existing project constraints

- Continue inline React styles backed by design tokens.
- Continue pure JS date handling for schedule calculations.
- Continue the dense, single-surface shell patterns established in phases 1 through 4.
- Do not add a second search modal, a second sidebar, or a second settings store.

---

## Architecture Patterns

### Pattern 1: Shared global tags via `tags` + `item_tags`

Recommended schema:

```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  color TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE item_tags (
  tag_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (tag_id, item_type, item_id),
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

Use one shared `item_type` enum: `habit | task | expense`. This avoids per-module tag tables and makes the cross-module view a straightforward union query instead of a three-store merge in the renderer.

### Pattern 2: Extend the shared context menu instead of forking per-module tag UIs

Current `ContextMenu.tsx` only supports flat rows. Tags require:

- checked state
- nested submenu rows
- the ability to keep the menu open while multiple tags are toggled

That should be solved once in the shared component, not reimplemented inside habits, planner, and expenses. Add `checked`, `children`, and `closeOnClick` to the shared menu item contract, then let each module supply the same `Tags` submenu structure.

### Pattern 3: Treat Tags as a shell module, not a floating panel

The phase context explicitly puts tags in the sidebar. The cleanest implementation is:

- add `tags` to the shell module union
- render a new `TagsView`
- keep the selected tag id in a small tags store
- let the sidebar list actual tag chips/buttons below the main module buttons

This keeps tag browsing aligned with the rest of the app instead of creating a bespoke overlay or filter bar.

### Pattern 4: Search through normalized queries, not a shadow index

For v1, a dedicated `SearchRepository` should:

1. run focused `LIKE` queries against `habits`, `tasks`, `expenses`, and `daily_notes`
2. shape each hit into one shared `SearchResult` contract
3. score prefix matches ahead of generic substring matches in JS
4. return one merged result list capped to the palette limit

This keeps Phase 5 smaller and avoids sync triggers across every write path. If the dataset outgrows that approach later, FTS can be introduced as a follow-up phase without changing the command-palette contract.

### Pattern 5: Let `App.tsx` own cross-module search navigation

The command palette already lives at the app shell level, so result navigation should stay there too. `App.tsx` should:

- switch the active module
- set planner date / notes tab for task and daily-note hits
- apply date filters for expense hits
- pass one-shot highlight props into module views so the matched row can scroll into view and flash

This avoids adding global search logic into individual stores that do not otherwise need to know the palette exists.

### Pattern 6: Introduce one shell event bridge for main-to-renderer behavior

Notifications and auto-updates both originate in the main process. The renderer currently only has invoke-style APIs; there is no event subscription channel.

Recommended addition:

```ts
shell.onNavigate(...)
shell.onUpdateStatus(...)
shell.installUpdate()
```

That one bridge gives notifications a way to focus `habits` and gives the updater a way to surface "update downloaded" without inventing two parallel event systems.

### Pattern 7: Notifications should use a testable scheduler service

Do not bury reminder logic directly inside `main/index.ts`. Create a small `HabitReminderService` with:

- pure schedule decision helpers
- a `checkNow()` method
- `start()` / `stop()` interval management
- one-per-day persistence using the settings store

Then `main/index.ts` only instantiates and starts the service. That keeps most of the logic unit-testable without relying on Electron runtime globals.

### Pattern 8: Packaging should use the assets already in the repo

The repo already has:

- `build/icon.ico`
- `build/icon.icns`
- `build/icon.png`
- `resources/icon.png`

That means the packaging plan does not need asset generation work. It should focus on:

- explicit `electron-builder` config
- `electron-updater` wiring
- a renderer update banner
- a release checklist that names `GH_TOKEN`, the GitHub repo, and the local verification commands

### Pattern 9: Packaging is the only non-autonomous plan

Even with code signing deferred, release publishing still needs human-owned credentials and a real GitHub Release. The packaging plan should therefore be marked `autonomous: false` so execution can stop for:

- `GH_TOKEN` presence
- first packaged build smoke check
- GitHub Release publication / updater verification

---

## Anti-Patterns

- Do not create separate tag implementations for habits, planner, and expenses.
- Do not replace `Ctrl+K` with a second dedicated search modal or shortcut.
- Do not add background notification behavior to the renderer; the scheduler belongs in the main process.
- Do not wire updater state directly into renderer stores through polling.
- Do not call Phase 5 "done" without a real packaged-build smoke check and a documented release path.
- Do not assume repository tests will run under the current local Node without rebuilding `better-sqlite3`.

---

## Do Not Hand-Roll

| Problem | Avoid | Use Instead | Why |
|---------|-------|-------------|-----|
| Tag creation overlay | `window.prompt()` | lightweight modal / dialog matching existing overlay patterns | keeps UX consistent and testable |
| Main-to-renderer events | ad hoc globals on `window` | preload `ipcRenderer.on(...)` bridge | follows Electron security model already established |
| Reminder scheduling | `node-cron` dependency | `setInterval` with minute-level checks | no new dependency and enough precision for a daily reminder |
| Packaging assets | generating new icons | existing `build/icon.*` files | already checked into the repo |
| Search routing | palette-specific store mutations everywhere | app-shell navigation handler | keeps cross-module behavior in one place |

---

## Common Pitfalls

### Pitfall 1: Tag submenu work stalls because the shared menu is still flat

If the first tags task tries to wire module views before `ContextMenu.tsx` supports nested checked items, each module will start inventing its own tag UI. Make the menu primitive richer first.

### Pitfall 2: Search looks "instant" but still feels broken because it cannot navigate to the exact item

Opening the right module is not enough. Tasks and expenses need date routing, and row-level highlights need to scroll the matched item into view so the user can see what they selected.

### Pitfall 3: Notification clicks focus the app but do not change the module

Electron `Notification` can focus the window, but without a renderer event bridge the app will stay on whatever module was open. That fails the phase requirement even though the OS notification technically fired.

### Pitfall 4: Reminder logic double-fires after restart

If "last sent" only lives in memory, restarting the app after the reminder time will fire the same day's reminder again. Persist the last-fired date in the main-process settings schema.

### Pitfall 5: Auto-updater verification cannot be completed in dev mode

`electron-updater` behaves differently in packaged builds and expects a reachable GitHub Release feed. The plan must separate local config verification from the human release step.

### Pitfall 6: Node-side DB tests currently fail on this machine

`npx vitest run tests/dashboard-ipc.test.ts tests/expense-analytics-ipc.test.ts` currently fails with:

`better_sqlite3.node was compiled against NODE_MODULE_VERSION 140; this Node requires 115`

That is an environment issue, not a Phase 5 design gap. Plans should prefer typecheck, renderer tests, and pure service tests unless native modules are rebuilt.

---

## Code Examples

### Shared tag contracts

```ts
export type ShellModuleId = 'dashboard' | 'habits' | 'planner' | 'expenses' | 'settings' | 'tags'
export type TaggableItemType = 'habit' | 'task' | 'expense'

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface TaggedItemSummary {
  itemType: TaggableItemType
  itemId: string
  title: string
  subtitle: string
  date: string | null
}
```

### Search result contract

```ts
export type SearchResultType = 'habit' | 'task' | 'expense' | 'daily_note'

export interface SearchResult {
  type: SearchResultType
  id: string
  title: string
  subtitle: string
  snippet: string | null
  date: string | null
}
```

### Shell event bridge

```ts
export interface ShellAPI {
  onNavigate: (callback: (payload: { module: ShellModuleId }) => void) => () => void
  onUpdateStatus: (callback: (payload: UpdateStatus) => void) => () => void
  installUpdate: () => Promise<void>
}
```

### Notification click behavior

```ts
notification.on('click', () => {
  mainWindow?.show()
  mainWindow?.focus()
  mainWindow?.webContents.send('shell:navigate', { module: 'habits' })
})
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run tests/tag-context-menu.test.tsx tests/tag-sidebar.test.tsx tests/command-palette-search.test.tsx tests/notification-settings.test.tsx tests/habit-reminder-service.test.ts tests/update-banner.test.tsx` |
| Full suite command | `npx vitest run` |
| Estimated runtime | ~15 seconds excluding native-module rebuild work |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Planned Command | File Exists? |
|--------|----------|-----------|-----------------|-------------|
| TAG-01 | shared tag menu and tag creation flow | component | `npx vitest run tests/tag-context-menu.test.tsx tests/tag-sidebar.test.tsx` | No - Wave 0 |
| TAG-02 | sidebar tag selection and grouped tag view | component + manual | `npx vitest run tests/tag-sidebar.test.tsx` | No - Wave 0 |
| KBD-04 | palette search rendering and keyboard nav | component | `npx vitest run tests/command-palette-search.test.tsx` | No - Wave 0 |
| KBD-04 | result navigation into module/date context | manual | N/A | N/A |
| HAB-09 | schedule decision and one-per-day guard | unit | `npx vitest run tests/habit-reminder-service.test.ts` | No - Wave 0 |
| HAB-09 | settings toggle and time input wiring | component | `npx vitest run tests/notification-settings.test.tsx` | No - Wave 0 |
| Packaging | updater banner and restart action | component | `npx vitest run tests/update-banner.test.tsx` | No - Wave 0 |
| Packaging | unpacked build smoke check | manual | `npm run build:unpack` | existing script |

### Wave 0 Gaps

- `tests/tag-context-menu.test.tsx`
- `tests/tag-sidebar.test.tsx`
- `tests/command-palette-search.test.tsx`
- `tests/habit-reminder-service.test.ts`
- `tests/notification-settings.test.tsx`
- `tests/update-banner.test.tsx`

### Environment Constraint

Node-side repository tests that import `better-sqlite3` are currently blocked by a native-module mismatch on this machine. That does not block planning, but it does mean Phase 5 should prefer:

- `npm run typecheck`
- renderer/component tests
- pure service tests
- grep-verifiable acceptance criteria

until native modules are rebuilt for the local Node runtime.

---

## Sources

### Primary

- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/phases/05-cross-module-distribution/05-CONTEXT.md`
- `.planning/phases/03-dashboard-navigation/03-UI-SPEC.md`
- `package.json`
- `src/main/index.ts`
- `src/main/ipc/index.ts`
- `src/main/ipc/settings.ts`
- `src/main/ipc/habits.ts`
- `src/main/ipc/planner.ts`
- `src/main/ipc/expenses.ts`
- `src/main/ipc/dashboard.ts`
- `src/main/settings/store.ts`
- `src/main/repositories/HabitRepository.ts`
- `src/main/repositories/PlannerRepository.ts`
- `src/main/repositories/ExpenseRepository.ts`
- `src/shared/domain-types.ts`
- `src/shared/ipc-types.ts`
- `src/preload/index.ts`
- `src/renderer/App.tsx`
- `src/renderer/shell/Sidebar.tsx`
- `src/renderer/shell/CommandPalette.tsx`
- `src/renderer/shell/KeyboardRouter.tsx`
- `src/renderer/shell/ModuleHeader.tsx`
- `src/renderer/shared/ContextMenu.tsx`
- `src/renderer/shared/useContextMenu.ts`
- `src/renderer/settings/SettingsView.tsx`
- `src/renderer/habits/HabitsView.tsx`
- `src/renderer/planner/PlannerView.tsx`
- `src/renderer/expenses/ExpensesView.tsx`
- `src/renderer/expenses/ExpenseRow.tsx`
- `build/icon.ico`
- `build/icon.png`
- `resources/icon.png`

### Local verification

- `git remote -v` -> `origin https://github.com/binsoy69/monolith.git`
- `npx vitest run tests/dashboard-ipc.test.ts tests/expense-analytics-ipc.test.ts` -> confirmed current `better-sqlite3` native-module mismatch under system Node

---

## Metadata

- Tag data-model recommendation: HIGH confidence
- Search architecture recommendation: HIGH confidence
- Notification scheduler recommendation: HIGH confidence
- Packaging / updater recommendation: HIGH confidence

Research date: 2026-03-29
Valid until: 2026-04-28
