---
status: complete
phase: 04-depth-differentiators
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md, 04-04-SUMMARY.md, 04-05-SUMMARY.md, 04-06-SUMMARY.md, 04-07-SUMMARY.md]
started: 2026-03-24T10:30:00+08:00
updated: 2026-03-24T11:45:00+08:00
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running Electron/dev process. Start the app from scratch. It boots without errors, migrations complete silently, and the main window loads with live dashboard data visible.
result: issue
reported: "(node:20592) UnhandledPromiseRejectionWarning: Error: The module '\\\\?\\D:\\projects\\Portfolio Projects\\monolith\\node_modules\\better-sqlite3\\build\\Release\\better_sqlite3.node' was compiled against a different Node.js version using NODE_MODULE_VERSION 115. This version of Node.js requires NODE_MODULE_VERSION 140. Please try re-compiling or re-installing the module."
severity: blocker

### 2. Create a Count-Based Habit
expected: Open the habit form. A Boolean/Count toggle is visible. Select "Count", enter a target number, and submit. The new habit appears with a count progress control instead of a checkbox.
result: pass

### 3. Manual Count Entry for a Large Value
expected: Expand a count-based habit. A direct numeric editor is visible in the expanded details. Enter a large value such as 1000 and apply it. The exact value is preserved, values below target stay incomplete, and values at or above target mark the habit complete.
result: issue
reported: "I should be able to edit the actual count because for example if the count is too large like drinking 1000 mL of water"
severity: major

### 4. Quick Increment on a Count Habit
expected: On a count-based habit, use the inline fraction pill/increment control from the collapsed row. The count increases immediately by 1 without needing to expand the card.
result: pass

### 5. Drag-Reorder Habits
expected: In the scheduled incomplete habits bucket, drag a habit by its handle to a new position. The order persists after navigating away and returning.
result: pass

### 6. Expand Habit Card for History
expected: Click a habit row body to expand it. Inline 7-day and 30-day summaries appear, and the history/heatmap section loads without breaking the rest of the card interactions.
result: pass

### 7. Heatmap Month Labels
expected: With a habit card expanded, the 90-day heatmap shows readable month labels around tight boundaries such as Dec/Jan. Labels do not overlap or collapse into the same slot, and heatmap cells still expose accessible date/value text.
result: issue
reported: "dec/jan month labels are overlapping with each other"
severity: cosmetic

### 8. Automatic Task Carry-Forward
expected: If there are incomplete tasks from a previous day, opening today's planner shows them carried forward automatically at the top of the incomplete list with a visible carried-state indicator.
result: pass

### 9. Set Task Priority via Context Menu
expected: Right-click a planner task. The context menu shows Set P1, Set P2, Set P3, and Clear Priority. Choosing one adds a visible priority badge to the task row.
result: pass

### 10. Priority Ordering in Today's List
expected: In today's planner list, higher-priority incomplete tasks sort above lower-priority tasks inside the same carry bucket. Carried tasks still stay above same-day tasks, and manual drag order remains meaningful only within the same carry/priority band.
result: pass

### 11. Overdue Task Indicator
expected: A carried-forward task whose original due date is earlier than today still shows the overdue marker on the task row after the new priority ordering is applied.
result: pass

### 12. Expense Analytics Discoverability
expected: In Expenses, analytics stays collapsed by default, but a clear full-width summary CTA is visible before expansion. It shows useful preview copy, and when data is loaded it includes the active month and total.
result: pass

### 13. Category Donut Chart
expected: Expanding analytics shows a donut chart with category breakdown plus custom legend rows that include category amount and percentage.
result: pass

### 14. Expense Trend Chart with Window Toggle
expected: Expanding analytics shows a trend chart with 3M, 6M, and 12M toggles. Switching windows updates the visible series immediately, and months with no expenses still render as zeros rather than gaps.
result: pass

## Summary

total: 14
passed: 11
issues: 3
pending: 0
skipped: 0

## Gaps

- truth: "Kill any running Electron/dev process. Start the app from scratch. It boots without errors, migrations complete silently, and the main window loads with live dashboard data visible."
  status: failed
  reason: "User reported: better-sqlite3 native module was compiled for NODE_MODULE_VERSION 115 while the current Electron/Node runtime requires NODE_MODULE_VERSION 140, causing startup to fail before the app can boot."
  severity: blocker
  test: 1
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
- truth: "Expand a count-based habit. A direct numeric editor is visible in the expanded details. Enter a large value such as 1000 and apply it. The exact value is preserved, values below target stay incomplete, and values at or above target mark the habit complete."
  status: failed
  reason: "User reported: I should be able to edit the actual count because for example if the count is too large like drinking 1000 mL of water"
  severity: major
  test: 3
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
- truth: "With a habit card expanded, the 90-day heatmap shows readable month labels around tight boundaries such as Dec/Jan. Labels do not overlap or collapse into the same slot, and heatmap cells still expose accessible date/value text."
  status: failed
  reason: "User reported: dec/jan month labels are overlapping with each other"
  severity: cosmetic
  test: 7
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
