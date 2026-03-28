# Phase 5: Cross-Module + Distribution - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase connects the three independent modules through a shared tag system and global search, adds desktop notifications for habit accountability, and packages the app as a distributable Windows binary with auto-update. Requirements: TAG-01, TAG-02, KBD-04, HAB-09.

</domain>

<decisions>
## Implementation Decisions

### Tag System
- **D-01:** Shared global tag pool — one set of tags applied across habits, tasks, and expenses. Same tag entity regardless of module.
- **D-02:** Tags applied via context menu — right-click item -> "Tags" submenu with checkboxes for existing tags + "New tag" option. Consistent with existing priority context menu pattern.
- **D-03:** Cross-module tag view lives in the sidebar — new "Tags" section below the module entries. Clicking a tag shows a unified list of all habits/tasks/expenses with that tag.
- **D-04:** Tags have auto-assigned colors from a fixed palette based on creation order. No user color picker.

### Global Search
- **D-05:** Extend existing Ctrl+K command palette — typing searches across all data (habits by name, tasks by title, expenses by notes/category, daily notes by content). Current quick-actions remain and appear alongside search results.
- **D-06:** Full-text search includes daily notes — results show a snippet of matching text with the date.
- **D-07:** Selecting a search result navigates to the item — habits -> Habits view, tasks -> Planner on that date, expenses -> Expenses filtered to that date, notes -> Planner on that date. Palette closes on selection.

### Notifications
- **D-08:** Single count-summary notification — "N habits unchecked today". Clicking opens app to Habits view.
- **D-09:** Fire once per day at the configured notificationTime. No repeat/snooze. Simple and non-annoying.
- **D-10:** Explicit on/off toggle in Settings next to the notification time picker. Off by default — user must opt in.

### Packaging & Distribution
- **D-11:** Windows-only for v1. NSIS installer (.exe) via electron-builder.
- **D-12:** Auto-update via electron-updater checking GitHub Releases on startup. Background download, prompt to restart.
- **D-13:** Skip code signing for v1 — ship unsigned. SmartScreen will warn but app works. Signing added when certificate is obtained.

### Agent's Discretion
- Tag chip visual styling (pill shape, size, font) — must fit the dense aesthetic
- Fixed color palette selection for auto-assigned tag colors — should complement the dark theme
- Search result grouping and ranking within the extended Ctrl+K palette
- NSIS installer customization (icon, banner, install path defaults)
- Auto-update UI (notification bar, modal, or toast)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — Core value, constraints, design principles
- `.planning/REQUIREMENTS.md` — TAG-01, TAG-02, KBD-04, HAB-09 acceptance criteria
- `.planning/ROADMAP.md` — Phase 5 success criteria and plan structure

### Prior Phase Context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Design token system, keyboard router decisions
- `.planning/phases/02-module-core/02-CONTEXT.md` — Module architecture, Zustand store patterns, optimistic updates, context menu pattern
- `.planning/phases/03-dashboard-navigation/03-CONTEXT.md` — Dashboard aggregation, command palette implementation
- `.planning/phases/04-depth-differentiators/04-CONTEXT.md` — Expand-in-place pattern, dnd-kit reorder, Recharts integration

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/renderer/shell/CommandPalette.tsx` — Ctrl+K palette with 3 hardcoded actions, filter-by-query logic, keyboard nav. Extend with search results.
- `src/renderer/shared/ContextMenu.tsx` — Shared context menu component used across all modules. Extend with tag submenu.
- `src/renderer/shared/useContextMenu.ts` — Hook for context menu positioning and state.
- `src/renderer/shell/Sidebar.tsx` — Sidebar with module navigation. Add Tags section.
- `src/renderer/shell/KeyboardRouter.tsx` — Global keyboard handler. Ctrl+K already wired.
- `src/renderer/settings/SettingsView.tsx` — Settings UI with auto-save pattern. Add notification toggle.

### Established Patterns
- Zustand store per module — tags will need its own store (first cross-module store)
- IPC bridge with typed channels — new handlers needed for tags, search, notifications
- Context menu actions via shared component — tags submenu follows same pattern as priority
- SQLite migrations via user_version pragma — new tables for tags and tag associations
- `notificationTime` already in AppSettings (`"HH:mm"` format) — add `notificationsEnabled: boolean`

### Integration Points
- New `tags` table + `item_tags` junction table in SQLite migrations
- New `TagsAPI` in ipc-types.ts (CRUD tags, associate/dissociate, query by tag)
- New `SearchAPI` in ipc-types.ts (full-text search across all tables)
- Electron `Notification` API in main process for OS-level notifications
- `node-cron` or `setInterval` in main process for scheduled notification check
- `electron-builder` config in package.json or electron-builder.yml
- `electron-updater` for GitHub Releases auto-update

</code_context>

<specifics>
## Specific Ideas

- Tags in context menu should mirror the existing priority submenu pattern — checkboxes, not radio buttons (multiple tags per item)
- Extended Ctrl+K should feel like a single unified experience — search results and quick-actions in one palette, not two modes
- Notification is deliberately minimal — one summary notification, once per day, opt-in only
- Installer should feel professional — custom icon, proper app name, clean install flow

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-cross-module-distribution*
*Context gathered: 2026-03-28*
