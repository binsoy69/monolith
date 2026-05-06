# Phase 7: Food Tracker - Context

**Gathered:** 2026-05-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a top-level food tracker module for simple meal logging, searchable food history, grouped food names, and weekly/monthly frequency analytics. This phase is about food journaling and pattern visibility, not calorie, macro, meal-planning, grocery, or nutrition tracking.

</domain>

<decisions>
## Implementation Decisions

### Logging flow
- **D-01:** Food is logged through both an inline quick-add flow and a full modal. Inline quick-add is the common fast path; the modal handles full detail and editing.
- **D-02:** Inline quick-add auto-picks meal type from the current time, and the inferred meal type is editable before saving.
- **D-03:** Meal entries store an exact meal time. The default is now, but the user can edit the time before saving.
- **D-04:** Notes are hidden by default in inline quick-add and appear only when expanded.

### Food grouping
- **D-05:** Grouping suggestions only point to foods that already exist in the user's history. The system should not invent a new parent food from scratch.
- **D-06:** Grouping suggestions require explicit confirmation before a meal entry is grouped.
- **D-07:** Rejected suggestions can appear again by default, but the UI should offer a "never suggest this" option to suppress a specific phrase/group suggestion.
- **D-08:** Group management lives in food detail. The user can open a food and change its group there; no dedicated merge/split screen is required for this phase.

### History search
- **D-09:** The default Food surface is a recent meal journal, with a prominent food search/filter mode.
- **D-10:** When filtering a specific food, matching meal entries appear first, with weekly/monthly counts shown as summary.
- **D-11:** History filters only need current week and current month for this phase.
- **D-12:** Search should support fuzzy matching, including typo tolerance such as "piza" finding "pizza".

### Analytics view
- **D-13:** Analytics leads with most-eaten foods and uses smaller supporting trend/rhythm views.
- **D-14:** The planner can choose the focused approach for exact-food versus grouped-food rankings, but must respect the grouping model above.
- **D-15:** Analytics only needs week and month periods for this phase.
- **D-16:** The planner can choose the specific analytics visual style, provided it stays dense, clear, and consistent with the app.

### Module integration
- **D-17:** Food is a top-level sidebar module alongside Habits, Planner, and Expenses.
- **D-18:** Food gets both a Ctrl+K quick action and a direct keyboard shortcut for logging a meal.
- **D-19:** Dashboard integration should show a food trend summary, such as most-eaten food this week/month, rather than only today's meal count.
- **D-20:** Food entries integrate with both tags and global search.

### the agent's Discretion
- Exact visual treatment for food analytics, including whether to use compact bars, small charts, cards, or a collapsible section.
- Exact grouped-versus-exact ranking behavior for most-eaten foods, as long as confirmed food groups are respected.
- Specific keyboard shortcut choice for direct meal logging, accounting for existing shortcut density.
- Empty states, row density, copy, and micro-interactions that preserve the app's fast, dark, power-tool feel.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project and Requirements
- `.planning/PROJECT.md` - Core value, local-only constraint, dark dense UI, speed, keyboard-first identity.
- `.planning/REQUIREMENTS.md` - FOOD-01, FOOD-02, FOOD-03 requirements and out-of-scope boundaries.
- `.planning/ROADMAP.md` - Phase 7 goal, success criteria, and phase dependencies.

### Prior Phase Context
- `.planning/phases/04-depth-differentiators/04-CONTEXT.md` - Analytics conventions, Recharts usage, collapsible chart section, dense visual history patterns.
- `.planning/phases/05-cross-module-distribution/05-CONTEXT.md` - Tags, global search, Ctrl+K extension, sidebar integration, cross-module patterns.
- `.planning/phases/06-wallet-edit-fix-and-transaction-logging/06-CONTEXT.md` - Modal/detail editing conventions and transaction-history style list patterns.

### Key Source Files
- `src/shared/domain-types.ts` - Existing domain model types; add food, meal entry, and grouping-related types here.
- `src/shared/ipc-types.ts` - Typed IPC API surface; add Food API, search result updates, and taggable item expansion here.
- `src/preload/index.ts` - IPC bridge; expose food methods to renderer.
- `src/main/db/migrations.ts` - SQLite schema migrations for food tables, indexes, grouping suggestions/suppressions, and tag associations.
- `src/main/ipc/index.ts` - IPC handler registration point for a new food handler.
- `src/main/repositories/ExpenseRepository.ts` - Closest repository pattern for list/filter/create/analytics queries.
- `src/main/repositories/SearchRepository.ts` - Global search expansion point for food entries and foods.
- `src/main/repositories/TagRepository.ts` - Taggable item expansion point for food entries.
- `src/renderer/App.tsx` - Module routing, new-item trigger, dashboard/search navigation integration.
- `src/renderer/shell/Sidebar.tsx` - Add Food as a top-level module.
- `src/renderer/shell/CommandPalette.tsx` - Add "Log meal" quick action and food search result handling.
- `src/renderer/shell/KeyboardRouter.tsx` - Add direct meal logging shortcut while preserving existing shortcut behavior.
- `src/renderer/shell/ModuleHeader.tsx` - Add Food module name.
- `src/renderer/dashboard/DashboardView.tsx` - Add food trend summary.
- `src/renderer/expenses/ExpensesView.tsx` - Closest full module layout pattern: header action, side/content split choices, analytics section, list, modal.
- `src/renderer/expenses/ExpenseLogModal.tsx` - Modal form pattern for full create/edit detail.
- `src/renderer/expenses/ExpenseAnalyticsSection.tsx` - Existing analytics section pattern to adapt or intentionally simplify.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ModuleHeader` can provide the Food header and quick action slot.
- `Sidebar` already owns top-level module navigation and can add a Food item.
- `CommandPalette` already mixes quick actions and search results; extend it with Log Meal and food results.
- `KeyboardRouter` is the global shortcut owner; add a direct meal logging shortcut there.
- `ExpenseLogModal` is the closest modal form pattern for create/edit data entry.
- `ExpenseAnalyticsSection`, `ExpenseDonutChart`, and `ExpenseTrendChart` demonstrate dense analytics styling and Recharts integration.
- `TagRepository` and `tags-store.ts` provide the existing cross-module tagging pattern.
- `SearchRepository` provides the current global search extension point.

### Established Patterns
- Local-only SQLite storage via migrations and repository classes.
- Typed IPC from main process to preload to renderer.
- One Zustand store per module with optimistic-feeling UI updates and rollback where needed.
- Pure JS date handling is preferred over date-fns because of prior ESM packaging issues.
- Dense dark UI with design tokens in `src/renderer/shared/styles/globals.css`.
- Cross-module features expand typed unions such as `ShellModuleId`, `TaggableItemType`, and search result types.

### Integration Points
- Add `food` to shell module types, navigation, module headers, app routing, shortcut overlay, and command palette quick actions.
- Add food tables and indexes for meal entries, canonical foods/groups, grouping suggestions, and suppressed suggestions.
- Add fuzzy food search for both history filtering and global search.
- Extend tags to support food entries.
- Extend dashboard data and repository aggregation with a food trend summary.
- Add food analytics queries for week/month most-eaten foods, trend/rhythm support, and grouped counts where applicable.

</code_context>

<specifics>
## Specific Ideas

- Inline quick-add should feel fast: food name first, inferred meal type/time editable, notes hidden unless expanded.
- Grouping should be conservative: suggest only known foods and require explicit confirmation.
- Search should be forgiving enough for typos.
- The Food module should feel like a personal food journal and pattern tracker, not a calorie tracker.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 07-food-tracker*
*Context gathered: 2026-05-06*
