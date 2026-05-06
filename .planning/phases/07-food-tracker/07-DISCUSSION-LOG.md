# Phase 7: Food Tracker - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-05-06
**Phase:** 07-food-tracker
**Areas discussed:** Logging flow, Food grouping, History search, Analytics view, Module integration

---

## Logging flow

| Question | Options | Selected |
|----------|---------|----------|
| How should adding a meal work day to day? | Modal only; Inline quick-add first; Both; You decide | Both |
| What should inline quick-add default meal type/time behavior be? | Auto-pick by current time; Manual required; Last used; You decide | Auto-pick by current time |
| What should be logged for time by default? | Exact current time; Meal period only; Editable exact time; You decide | Editable exact time |
| How visible should notes be during fast logging? | Hidden by default; Always visible; Prompt after save; You decide | Hidden by default |

**User's choice:** Inline quick-add plus modal; infer meal type by time; exact editable timestamp; notes hidden unless expanded.
**Notes:** The logging flow prioritizes speed while preserving full detail entry when needed.

---

## Food grouping

| Question | Options | Selected |
|----------|---------|----------|
| What should auto-suggestions group variants under? | Exact known food only; Likely base food; Restaurant/brand separate; You decide | Exact known food only |
| How should suggestions behave? | Auto-selected but visible; Manual confirmation required; Save ungrouped unless selected; You decide | Manual confirmation required |
| What happens after rejecting a suggestion? | Suggest again next time; Remember rejection; Offer never suggest this; You decide | Offer never suggest this |
| How should groups be managed after logging? | Edit group from food detail; Merge foods screen; Minimal correction only; You decide | Edit group from food detail |

**User's choice:** Conservative known-food suggestions, explicit confirmation, suppressible suggestions, and group editing from food detail.
**Notes:** Grouping should avoid surprising automatic rollups.

---

## History search

| Question | Options | Selected |
|----------|---------|----------|
| What should the primary history surface emphasize? | Recent meal journal; Food lookup; Hybrid; You decide | Hybrid |
| What should filtered food results show first? | Entries first; Counts first; Food detail page; You decide | Entries first |
| What date filters matter? | Week/month only; Preset ranges; Calendar range; You decide | Week/month only |
| How forgiving should search matching be? | Basic contains; Fuzzy match; Grouped match; Basic + grouped | Fuzzy match |

**User's choice:** Recent meal journal by default, prominent food search/filter mode, entries-first results, week/month filters, typo-tolerant fuzzy search.
**Notes:** Search and history should answer "how often have I eaten this?" without burying the meal entries.

---

## Analytics view

| Question | Options | Selected |
|----------|---------|----------|
| What should analytics lead with? | Most-eaten foods; Eating rhythm; Trend over time; Mix | Mix |
| Should grouped variants roll up by default? | Roll up by group; Show exact foods; Toggle exact/grouped; You decide | You decide |
| What trend period should analytics support? | Week and month only; 7/30/90 days; 3/6/12 months; You decide | Week and month only |
| How chart-heavy should food tracker be? | Mostly ranked lists; Chart section like expenses; Dashboard-like cards; You decide | You decide |

**User's choice:** Most-eaten foods first, supporting trend/rhythm views, week/month periods, planner discretion for exact visual style and ranking details.
**Notes:** Analytics should stay compact and aligned with the app's dense design.

---

## Module integration

| Question | Options | Selected |
|----------|---------|----------|
| Where should Food live in navigation? | Top-level module; Inside Expenses; Dashboard-only entry; You decide | Top-level module |
| How should quick-add shortcuts include food? | Ctrl+K quick action; Dedicated shortcut; Both; You decide | Both |
| Should food appear on the dashboard? | Today summary; Trend summary; No dashboard; You decide | Trend summary |
| Should food entries participate in tags and global search? | Global search only; Tags only; Both tags and global search; Neither | Both tags and global search |

**User's choice:** Food is a top-level module with Ctrl+K and direct shortcut access, dashboard trend summary, and integration with tags and global search.
**Notes:** Food should behave like a first-class module, not an expenses subfeature.

---

## the agent's Discretion

- Exact visual treatment for food analytics.
- Exact grouped-versus-exact ranking behavior for most-eaten foods.
- Specific direct keyboard shortcut for meal logging.
- Empty states, labels, and interaction details that preserve speed and density.

## Deferred Ideas

None.
