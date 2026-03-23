---
status: diagnosed
phase: 04-depth-differentiators
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md]
started: 2026-03-23T07:30:00+08:00
updated: 2026-03-23T21:57:26.6791261+08:00
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running dev server. Start the Electron app from scratch. App boots without errors, migrations complete silently, and the main window loads with dashboard data visible.
result: pass

### 2. Create a Count-Based Habit
expected: Open the habit form. A Boolean/Count toggle is visible. Select "Count", enter a target number. Submit. The new habit appears in the list with a count progress control (not a checkbox).
result: issue
reported: "I should be able to update the value manually for example if I want the count to be 1000 for mL on drinking water."
severity: major

### 3. Increment Count on a Habit
expected: On a count-based habit, click the increment control. The count increases by 1. When the count reaches the target, the habit shows as complete.
result: pass

### 4. Drag-Reorder Habits
expected: In the scheduled incomplete habits bucket, drag a habit by its handle to a new position. The reorder persists after navigating away and returning.
result: pass

### 5. Expand Habit Card for History
expected: Click on a habit row body to expand it. A 7-day and 30-day summary appears inline. The heatmap section loads on first expand.
result: issue
reported: "7-day and 30-day summary looks correct but the heatmap has visual bug, the dec and jan month are not properly spaced to each other"
severity: cosmetic

### 6. View 90-Day Heatmap
expected: With a habit card expanded, a 90-day SVG heatmap is visible with month labels. Cells show completion intensity. Hovering or focusing a cell shows accessible date/value text.
result: issue
reported: "month labels has bug"
severity: cosmetic

### 7. Automatic Task Carry-Forward
expected: If there are incomplete tasks from a previous day, opening the planner for today shows those tasks carried forward automatically. Carried tasks have a visible border indicator distinguishing them from today's tasks.
result: pass

### 8. Set Task Priority via Context Menu
expected: Right-click a planner task. Context menu shows "Set P1", "Set P2", "Set P3", and "Clear Priority" actions. Selecting one adds a visible priority badge (colored) to the task row.
result: issue
reported: "higher priority should be on the top always"
severity: major

### 9. Overdue Task Indicator
expected: A carried-forward task that was originally due on a past date shows a small overdue marker/text on the task row.
result: pass

### 10. Expense Analytics Section
expected: On the Expenses view, a collapsible analytics section appears above the expense list. It is collapsed by default. Clicking to expand shows a monthly total header and chart area.
result: issue
reported: "the button/text for this is not intuitively visible - bad UX"
severity: minor

### 11. Category Donut Chart
expected: With analytics expanded, a donut chart displays expense breakdown by category with a center total. Custom legend rows show each category's amount and percentage.
result: pass

### 12. Expense Trend Chart with Window Toggle
expected: With analytics expanded, a trend line chart shows monthly spending over time. A 3M / 6M / 12M toggle switches the visible window. Months with no expenses show as zero (no gaps).
result: pass

## Summary

total: 12
passed: 7
issues: 5
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Open the habit form. A Boolean/Count toggle is visible. Select \"Count\", enter a target number. Submit. The new habit appears in the list with a count progress control (not a checkbox)."
  status: failed
  reason: "User reported: I should be able to update the value manually for example if I want the count to be 1000 for mL on drinking water."
  severity: major
  test: 2
  root_cause: "Count habits only expose increment and reset semantics after creation. There is no renderer input, store action, or IPC contract for directly setting a measured count value."
  artifacts:
    - path: "src/renderer/habits/HabitCard.tsx"
      issue: "Count habits render a single increment button showing todayValue/targetCount with no editable input or secondary manual-entry affordance."
    - path: "src/renderer/habits/habits-store.ts"
      issue: "The store only implements incrementCount and resetCount flows, so arbitrary value edits cannot be expressed."
    - path: "src/shared/ipc-types.ts"
      issue: "HabitsAPI exposes incrementCount and resetCount but no direct set-count mutation."
  missing:
    - "Add a direct count-entry interaction for count habits, suitable for large measured targets such as water in mL."
    - "Add a set-count IPC and store contract so arbitrary progress values can be saved instead of only stepping by one."
  debug_session: ".planning/debug/habit-count-manual-input.md"
- truth: "Click on a habit row body to expand it. A 7-day and 30-day summary appears inline. The heatmap section loads on first expand."
  status: failed
  reason: "User reported: 7-day and 30-day summary looks correct but the heatmap has visual bug, the dec and jan month are not properly spaced to each other"
  severity: cosmetic
  test: 5
  root_cause: "HabitHeatmap computes month labels from day-level month transitions, then renders them on week-column coordinates without deduping or collision handling. When month changes occur in the same or adjacent columns, labels overlap or appear poorly spaced."
  artifacts:
    - path: "src/renderer/habits/HabitHeatmap.tsx"
      issue: "monthLabels are pushed on any daily month boundary and then absolutely positioned by Math.floor(index / ROWS) with no collision avoidance."
  missing:
    - "Derive month labels from the displayed week columns rather than raw day transitions."
    - "Suppress, merge, or offset labels that would land in the same or adjacent columns."
  debug_session: ".planning/debug/habit-heatmap-month-labels.md"
- truth: "With a habit card expanded, a 90-day SVG heatmap is visible with month labels. Cells show completion intensity. Hovering or focusing a cell shows accessible date/value text."
  status: failed
  reason: "User reported: month labels has bug"
  severity: cosmetic
  test: 6
  root_cause: "The heatmap label pipeline is column-agnostic at generation time and absolute-positioned at render time, so month labels are visually unstable even though the cells themselves render and expose aria-label/title text."
  artifacts:
    - path: "src/renderer/habits/HabitHeatmap.tsx"
      issue: "Label generation is based on raw daily history while rendering is based on week columns, which makes month labels the unstable part of the heatmap."
  missing:
    - "Move month-label generation to the same weekly coordinate system used by the grid."
    - "Add a layout rule that preserves readable month labels across boundaries such as Dec/Jan."
  debug_session: ".planning/debug/habit-heatmap-month-labels.md"
- truth: "Right-click a planner task. Context menu shows \"Set P1\", \"Set P2\", \"Set P3\", and \"Clear Priority\" actions. Selecting one adds a visible priority badge (colored) to the task row."
  status: failed
  reason: "User reported: higher priority should be on the top always"
  severity: major
  test: 8
  root_cause: "Priority is persisted and rendered, but today ordering ignores it. Both the repository query and renderer list sort only by completion, manual position, and creation time, so the priority badge is decorative."
  artifacts:
    - path: "src/main/repositories/PlannerRepository.ts"
      issue: "listForDate orders by completed, position, and created_at without factoring priority into the returned task order."
    - path: "src/renderer/planner/TaskList.tsx"
      issue: "Incomplete tasks are sorted only by position and createdAt, so updating priority does not move tasks toward the top."
  missing:
    - "Define how priority ordering should interact with carry-forward and manual drag ordering."
    - "Apply priority-aware ordering consistently in the repository and renderer so higher-priority tasks surface first."
  debug_session: ".planning/debug/planner-priority-ordering.md"
- truth: "On the Expenses view, a collapsible analytics section appears above the expense list. It is collapsed by default. Clicking to expand shows a monthly total header and chart area."
  status: failed
  reason: "User reported: the button/text for this is not intuitively visible - bad UX"
  severity: minor
  test: 10
  root_cause: "The analytics section is hidden behind a low-emphasis text toggle labeled 'Show charts'. The collapsed state exposes no summary and the trigger is styled like secondary helper text, so the feature is easy to miss."
  artifacts:
    - path: "src/renderer/expenses/ExpenseAnalyticsSection.tsx"
      issue: "The toggle uses small text, no border, no icon, and no supporting summary copy, which weakens discoverability."
    - path: "src/renderer/expenses/ExpensesView.tsx"
      issue: "showAnalytics defaults to false, so the subtle toggle is the only indicator that analytics exists."
  missing:
    - "Increase the collapsed-state affordance with clearer copy and stronger visual treatment."
    - "Expose a visible summary or preview so analytics presence is discoverable before expansion."
  debug_session: ".planning/debug/expense-analytics-toggle-affordance.md"
