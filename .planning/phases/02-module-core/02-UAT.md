---
status: complete
phase: 02-module-core
source: 02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md, 02-05-SUMMARY.md, 02-06-SUMMARY.md
started: 2026-03-21T06:00:00Z
updated: 2026-03-21T07:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Habits Today View & Check-Off
expected: Navigate to Habits module. Habit cards display sorted: unchecked scheduled habits first, unscheduled habits dimmed (lower opacity), completed habits sunk to bottom. A progress summary (e.g., "2/5") shows at the top. Clicking a habit's circular checkbox toggles it complete — card sinks to bottom with reduced opacity. Clicking again uncompletes it and card rises back up.
result: pass

### 2. Create New Habit
expected: Press N key (or click "+ New Habit" button in header). An inline form expands at top with a name input (auto-focused) and a 7-day picker (Mon-Sun). Select days, type a name, press Enter. The new habit card appears in the list. The form closes and list returns to full opacity.
result: issue
reported: "Text sizes are too small for create habit button, also it is not easily recognizable, opacity for the text are also not clearly visible. Same with other text on the app"
severity: cosmetic

### 3. Edit Habit via Context Menu
expected: Right-click on a habit card. A context menu appears with "Edit" and "Archive" options. Click "Edit" — the HabitForm opens pre-filled with the habit's name and scheduled days. Modify the name or days, press Enter. The habit card updates with the new values.
result: pass

### 4. Archive Habit with Confirmation
expected: Right-click a habit card, click "Archive". The habit card is replaced in-place by an archive confirmation prompt with destructive "Archive" button and "Keep Habit" cancel. Click "Archive" — the habit disappears from the active list.
result: pass

### 5. Archived Habits View
expected: Click "Show Archived" toggle in the Habits header area. A list of archived habits appears showing each habit's name and formatted schedule days (e.g., "Mon, Wed, Fri" or "Every day"). If no habits are archived, shows "No archived habits" empty state.
result: issue
reported: "after creating habit, there are no specific day showing"
severity: major

### 6. Planner: Add Task & Check Off
expected: Navigate to Planner module. A quick-add input is visible at the top. Type a task name and press Enter — the task appears in the list below. Click the square checkbox on a task — it gets a strikethrough and reduced opacity, and sinks below incomplete tasks. Click again to uncomplete.
result: pass

### 7. Planner: Date Navigation
expected: The planner header shows today's date (e.g., "Fri Mar 21") with left/right arrow buttons and a done/total count (e.g., "0/3"). Click right arrow — date advances to tomorrow, task list updates. Click left arrow — goes back. The "Today" label appears in accent color when viewing today's date.
result: issue
reported: "I should be able to click on today, and then the calendar with a nice ui should pop out and the calendar should also show dots for days that have tasks. The planner header only shows 'Today' no dates like Fri Mar 21 but if i navigate to other dates it shows, Sun, Mar 22"
severity: major

### 8. Planner: Drag-and-Drop Reorder
expected: With 2+ incomplete tasks in the planner, grab a task by its drag handle (grip icon on the left). Drag it above or below another task. Release — the task stays in the new position. The reorder persists after navigating away and back.
result: pass

### 9. Planner: Task Edit & Delete via Context Menu
expected: Right-click a task. A context menu shows Edit, Move to date, and Delete. Click "Edit" — an inline form appears below the task row with title and notes fields, auto-focused. Modify and press Enter to save. For Delete — a confirmation row replaces the task ("Delete this task?" with Delete/Keep Task buttons). Click Delete to remove it.
result: issue
reported: "I should be able to click on a task and then it would show the notes for that task"
severity: major

### 10. Planner: Move Task to Another Date
expected: Right-click a task, click "Move to date". A native date picker appears. Select a different date — the task disappears from the current day's list. Navigate to that date — the task appears there.
result: issue
reported: "it works, but the UI for the date picker is too plain, make it more nice ui"
severity: cosmetic

### 11. Planner: Keyboard Shortcuts
expected: While in the Planner module (not focused on an input), press ArrowRight — date advances one day. Press ArrowLeft — goes back. Press T — jumps to today's date.
result: pass

### 12. Planner: Daily Notes
expected: In the Planner, click the "Notes" tab. A plain textarea appears. Type some text — it auto-saves after a brief pause (500ms debounce). Navigate to another date and back — the notes persist for that date.
result: pass

### 13. Wallet: Create & View
expected: Navigate to Expenses module. A wallet panel (left sidebar, ~200px) shows. If no wallets exist, an empty state says "Create a wallet first" with an "Add Wallet" button. Click it — an inline form with name + balance inputs appears. Enter a name and balance, click Save. The wallet card appears showing name and formatted balance (₱).
result: issue
reported: "after clicking add wallet button, the text inputs are on the very bottom, this is bad ux."
severity: cosmetic

### 14. Wallet: Adjust Balance
expected: On a wallet card, click the balance adjust icon (up/down arrows). A small modal appears with two modes: "Set balance" and "Add / Subtract". In Set mode, enter a new balance and Save — the wallet balance updates. In Add/Subtract mode, enter a delta amount — balance changes by that amount.
result: issue
reported: "UI/UX so bad, the function works but UX/UI so bad. icons are small."
severity: cosmetic

### 15. Log New Expense
expected: Click "+ Log Expense" in the header (or press N key). A modal appears with: Amount (₱ prefix), Date (defaults today), Category (dropdown with color dots), Wallet (select), Notes (optional). Fill in amount, select category and wallet, click "Log Expense". The expense appears in the list and the wallet balance decreases by the amount.
result: pass

### 16. Expense List & Filters
expected: After logging expenses, the right panel shows a chronological list with date, amount (₱), category (color dot + name), and wallet name per row. A filter bar at top has From/To date inputs and a category select. Setting filters narrows the list. A "Clear filters" button resets all filters.
result: issue
reported: "UI for calendar seems to be very basic, enhance its ui"
severity: cosmetic

### 17. Expense Edit & Delete
expected: Right-click an expense row. A context menu shows Edit and Delete. Click Edit — the log modal opens pre-filled with that expense's data. Modify and save — the expense updates and wallet balance adjusts. Click Delete — a confirmation overlay appears. Confirm delete — the expense is removed and wallet balance is restored.
result: pass

### 18. Category Management
expected: In the Expenses module, click "Manage categories" toggle link. A category list appears with color dots, editable names, and delete buttons. Click a color dot — a 12-color palette popup appears to change the color. Click a category name to edit it inline. Delete a category with no linked expenses — it's removed. Delete a category in use — a toast says it can't be deleted.
result: issue
reported: "I cant add another category? also manage categories section and text is barely visible"
severity: major

## Summary

total: 18
passed: 9
issues: 9
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Create habit button and text should be clearly visible with proper sizing"
  status: failed
  reason: "User reported: Text sizes are too small for create habit button, also it is not easily recognizable, opacity for the text are also not clearly visible. Same with other text on the app"
  severity: cosmetic
  test: 2
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Archived habits show formatted schedule days (e.g., 'Mon, Wed, Fri' or 'Every day')"
  status: failed
  reason: "User reported: after creating habit, there are no specific day showing"
  severity: major
  test: 5
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Planner header shows today's date format (e.g., 'Fri Mar 21') and clicking date opens a calendar popup with task dots"
  status: failed
  reason: "User reported: I should be able to click on today, and then the calendar with a nice ui should pop out and the calendar should also show dots for days that have tasks. The planner header only shows 'Today' no dates like Fri Mar 21 but if i navigate to other dates it shows, Sun, Mar 22"
  severity: major
  test: 7
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Clicking a task expands to show its notes inline"
  status: failed
  reason: "User reported: I should be able to click on a task and then it would show the notes for that task"
  severity: major
  test: 9
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Move-to-date picker has polished, styled UI"
  status: failed
  reason: "User reported: it works, but the UI for the date picker is too plain, make it more nice ui"
  severity: cosmetic
  test: 10
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Add wallet form inputs appear near the button, not at the bottom"
  status: failed
  reason: "User reported: after clicking add wallet button, the text inputs are on the very bottom, this is bad ux."
  severity: cosmetic
  test: 13
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Wallet adjust balance UI has properly sized icons and good UX"
  status: failed
  reason: "User reported: UI/UX so bad, the function works but UX/UI so bad. icons are small."
  severity: cosmetic
  test: 14
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Expense filter date picker has enhanced, styled UI"
  status: failed
  reason: "User reported: UI for calendar seems to be very basic, enhance its ui"
  severity: cosmetic
  test: 16
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Users can add new categories and manage categories section text is clearly visible"
  status: failed
  reason: "User reported: I cant add another category? also manage categories section and text is barely visible"
  severity: major
  test: 18
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
