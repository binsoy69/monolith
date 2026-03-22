# Phase 4: Depth + Differentiators - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase adds the features that make Monolith genuinely preferred over three separate apps — visual history, behavioral patterns, automatic intelligence (carry-forward), and analytical depth. All three modules gain depth features: habits get heatmaps/history/reorder/count-based tracking, planner gets priority/carry-forward/overdue indicators, expenses get monthly totals/category charts/trend lines.

Requirements: HAB-04, HAB-06, HAB-07, HAB-08, PLAN-06, PLAN-07, PLAN-08, EXP-04, EXP-05, EXP-10

</domain>

<decisions>
## Implementation Decisions

### Habit Heatmap & History
- **D-01:** Completion history (7/30 day) and heatmap display via expand-in-place — click a HabitCard to expand it inline, showing history and mini heatmap below the card. No separate view or panel.
- **D-02:** Heatmap uses single-color intensity scale — existing `--color-accent` from transparent to full saturation. Matches GitHub contribution graph style but uses the app's accent color.
- **D-03:** Heatmap shows last 90 days — fits cleanly in the expanded card without scrolling or tiny cells.

### Count-Based Habits
- **D-04:** Count-based habits display as inline fraction (`3/8`) next to the habit name. Click the card to increment the count. Minimal UI change — same card layout as boolean habits.
- **D-05:** When count reaches target, the habit shows as "completed" with the same visual treatment as a checked boolean habit.

### Task Carry-Forward
- **D-06:** Carry-forward triggers on app open — when the app launches, incomplete tasks from past days automatically move to today. No midnight timer or manual process.
- **D-07:** Carried-forward tasks distinguished by a subtle accent left-border (orange/amber stripe) on the task row. Not grouped separately — they appear at the top of today's list with the visual indicator.

### Task Priority
- **D-08:** P1/P2/P3 priority levels on tasks. Visual treatment at agent's discretion — should be subtle and consistent with the dense aesthetic.

### Overdue Indicators
- **D-09:** Overdue tasks (carried forward or past-due) display a visible indicator. Style at agent's discretion — should be noticeable but not alarming.

### Expense Charts
- **D-10:** Category breakdown as donut chart — ring with category slices, total spending amount displayed in the center. Styled to match the dark, dense aesthetic.
- **D-11:** Charts live inline in ExpensesView — collapsible summary section above the expense list. Not a separate tab or sidebar view.
- **D-12:** Trend line period is toggleable: 3 / 6 / 12 month options. Default to 6 months.

### Habit Manual Reorder
- **D-13:** Habits can be manually reordered. Uses dnd-kit (already in the project for task reorder in Phase 2). Same drag handle pattern as TaskRow.

### Agent's Discretion
- Task priority visual treatment (P1/P2/P3 indicators) — subtle, consistent with dense aesthetic
- Overdue task indicator styling — noticeable but not alarming
- Exact chart color palette for expense charts — must match dark theme
- Monthly spending totals layout within the collapsible summary section

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — Core value, constraints, design principles
- `.planning/REQUIREMENTS.md` — HAB-04/06/07/08, PLAN-06/07/08, EXP-04/05/10 acceptance criteria
- `.planning/ROADMAP.md` — Phase 4 success criteria and plan structure

### Prior Phase Context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Design token system, keyboard router decisions
- `.planning/phases/02-module-core/02-CONTEXT.md` — Module architecture, Zustand store patterns, optimistic updates
- `.planning/phases/03-dashboard-navigation/03-CONTEXT.md` — Dashboard aggregation, command palette patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/renderer/habits/HabitCard.tsx` — Card component to extend with expand-in-place history/heatmap
- `src/renderer/habits/habits-store.ts` — Zustand store to extend with count-based operations and reorder
- `src/renderer/habits/HabitCheckbox.tsx` — Checkbox component (boolean habits keep this, count-based use fraction display)
- `src/renderer/planner/TaskRow.tsx` — SortableTaskRow + PlainTaskRow with dnd-kit integration (reference for habit reorder)
- `src/renderer/planner/planner-store.ts` — Task store to extend with carry-forward logic and priority
- `src/renderer/expenses/expenses-store.ts` — Expense store to extend with aggregation queries
- `src/renderer/expenses/ExpensesView.tsx` — View to extend with collapsible chart section
- `src/renderer/shared/CalendarPopup.tsx` — Reusable calendar component
- `src/renderer/dashboard/` — Dashboard cards showing aggregated data (reference pattern for expense summary)

### Established Patterns
- Zustand store per module — each module owns its state independently
- Optimistic updates — toggle UI immediately, rollback on IPC error
- Pure JS date arithmetic — no date-fns (ESM packaging bug workaround)
- Design tokens in globals.css — `--color-accent`, `--color-bg-elevated`, `--radius-md`, etc.
- IPC bridge pattern — typed channels, handlers in main process
- dnd-kit for drag reorder — SortableContext wraps only active items

### Integration Points
- New IPC handlers needed: habit history query, habit reorder, task carry-forward, expense aggregation
- Recharts needs to be installed (chosen in PROJECT.md but not yet added to package.json)
- HabitCard needs expansion state management (likely in HabitsView, same pattern as expandedTaskId in PlannerView)
- Task domain-types.ts needs priority field added
- Habit domain-types.ts needs targetCount/currentCount fields added

</code_context>

<specifics>
## Specific Ideas

- Heatmap should look like GitHub's contribution graph but in the app's accent color
- Count-based habits should feel identical to boolean habits in card layout — the fraction text replaces the streak display area or sits alongside it
- Carry-forward happens silently on app open — no modal or confirmation, just tasks appear with the accent border
- Donut chart should show total amount in center — power-user density, glanceable

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-depth-differentiators*
*Context gathered: 2026-03-22*
