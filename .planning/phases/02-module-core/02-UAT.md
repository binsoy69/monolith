---
status: diagnosed
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
  root_cause: "Design system --font-size-small is 11px and --color-text-muted is #5a5a72 (very low contrast against #16161e background). The '+ New Habit' button and progress bar use these tokens, making text barely legible app-wide."
  artifacts:
    - path: "src/renderer/shared/styles/globals.css"
      issue: "--font-size-small: 11px too small; --color-text-muted: #5a5a72 too dim"
    - path: "src/renderer/habits/HabitsView.tsx"
      issue: "'+ New Habit' button uses fontSize: var(--font-size-small) (11px)"
    - path: "src/renderer/habits/HabitForm.tsx"
      issue: "'Create Habit' submit button uses fontSize: var(--font-size-small)"
    - path: "src/renderer/habits/HabitProgressBar.tsx"
      issue: "Progress text uses font-size-small + color-text-muted"
  missing:
    - "Increase --font-size-small from 11px to 12px in globals.css"
    - "Brighten --color-text-muted from #5a5a72 to ~#7a7a92"
    - "Use font-size-body (13px) for header action buttons"

- truth: "Archived habits show formatted schedule days (e.g., 'Mon, Wed, Fri' or 'Every day')"
  status: failed
  reason: "User reported: after creating habit, there are no specific day showing"
  severity: major
  test: 5
  root_cause: "ArchivedHabitsView renders days text with var(--color-text-muted) (#5a5a72) at var(--font-size-small) (11px), making schedule days effectively invisible against the dark background."
  artifacts:
    - path: "src/renderer/habits/ArchivedHabitsView.tsx"
      issue: "Days span uses color-text-muted + font-size-small — near-invisible on dark theme"
    - path: "src/renderer/habits/HabitCard.tsx"
      issue: "Active habit card does NOT display schedule days at all"
  missing:
    - "Change days text color from var(--color-text-muted) to var(--color-text-secondary)"
    - "Bump font size from var(--font-size-small) to var(--font-size-body)"
    - "Optionally show schedule days on active HabitCard as subtitle"

- truth: "Planner header shows today's date format (e.g., 'Fri Mar 21') and clicking date opens a calendar popup with task dots"
  status: failed
  reason: "User reported: I should be able to click on today, and then the calendar with a nice ui should pop out and the calendar should also show dots for days that have tasks. The planner header only shows 'Today' no dates like Fri Mar 21 but if i navigate to other dates it shows, Sun, Mar 22"
  severity: major
  test: 7
  root_cause: "DateNav.tsx line 65 ternary replaces formatted date entirely with 'Today' string. The date label is a plain <span> with no click handler — no calendar popup component exists."
  artifacts:
    - path: "src/renderer/planner/DateNav.tsx"
      issue: "Line 65: isToday ternary hides formatted date; lines 56-66: span has no onClick"
    - path: "src/renderer/planner/PlannerView.tsx"
      issue: "No calendar-related state or callback passed to DateNav"
    - path: "src/renderer/planner/planner-store.ts"
      issue: "setViewDate exists but nothing in UI invokes it directly"
  missing:
    - "Always show formatDate(viewDate), add 'Today' accent badge alongside"
    - "Create CalendarPopup component with monthly grid, task-day dots, dark theme"
    - "Add onClick to date label to toggle calendar popup"
    - "Add IPC endpoint planner.getDatesWithTasks(month, year)"

- truth: "Clicking a task expands to show its notes inline"
  status: failed
  reason: "User reported: I should be able to click on a task and then it would show the notes for that task"
  severity: major
  test: 9
  root_cause: "TaskRow has no onClick handler on the title/row area — only the checkbox has onClick. task.notes is never rendered in TaskRow; notes are only visible through TaskEditForm via right-click > Edit."
  artifacts:
    - path: "src/renderer/planner/TaskRow.tsx"
      issue: "No onClick on row; task.notes never rendered; no expanded/collapsed state"
    - path: "src/renderer/planner/TaskList.tsx"
      issue: "No expandedTaskId state or onClickTask callback"
    - path: "src/renderer/planner/PlannerView.tsx"
      issue: "No expanded-task state; only path to notes is context menu Edit"
  missing:
    - "Add expandedTaskId state to PlannerView/TaskList"
    - "Add onClick to task title area that toggles expanded state"
    - "Create read-only notes expansion panel below task row"
    - "Add subtle notes indicator icon on rows with non-empty notes"

- truth: "Move-to-date picker has polished, styled UI"
  status: failed
  reason: "User reported: it works, but the UI for the date picker is too plain, make it more nice ui"
  severity: cosmetic
  test: 10
  root_cause: "PlannerView renders a hidden native <input type='date'> with opacity: 0, then calls showPicker() — delegates entirely to browser's native date dialog with no app styling."
  artifacts:
    - path: "src/renderer/planner/PlannerView.tsx"
      issue: "Lines 183-199: <input type='date'> with opacity: 0 — native browser datepicker"
  missing:
    - "Create shared DatePickerPopover component matching dark theme"
    - "Replace native input with custom calendar popover positioned near click point"

- truth: "Add wallet form inputs appear near the button, not at the bottom"
  status: failed
  reason: "User reported: after clicking add wallet button, the text inputs are on the very bottom, this is bad ux."
  severity: cosmetic
  test: 13
  root_cause: "In WalletPanel.tsx, the showAddForm block is placed AFTER the flex: 1 wallet list container, so it always renders at the very bottom of the panel regardless of content."
  artifacts:
    - path: "src/renderer/expenses/WalletPanel.tsx"
      issue: "Lines 153-252: add form div is sibling AFTER flex:1 wallet list — renders at bottom"
  missing:
    - "Move add wallet form inside scrollable wallet list area, before wallet cards"
    - "Or render form right after the '+ Add Wallet' button"

- truth: "Wallet adjust balance UI has properly sized icons and good UX"
  status: failed
  reason: "User reported: UI/UX so bad, the function works but UX/UI so bad. icons are small."
  severity: cosmetic
  test: 14
  root_cause: "WalletCard.tsx action buttons use Lucide icons at size={14} with padding: 0 and color: var(--color-text-muted) — nearly invisible and difficult to click at 14px with no hit area."
  artifacts:
    - path: "src/renderer/expenses/WalletCard.tsx"
      issue: "Icons at size={14}, padding: 0, color-text-muted — too small and dim"
  missing:
    - "Increase icon size from 14 to 16-18px"
    - "Add padding (4px) for proper click target"
    - "Use --color-text-secondary as default color"
    - "Add subtle hover background with border-radius"

- truth: "Expense filter date picker has enhanced, styled UI"
  status: failed
  reason: "User reported: UI for calendar seems to be very basic, enhance its ui"
  severity: cosmetic
  test: 16
  root_cause: "ExpenseFilterBar.tsx uses two native <input type='date'> elements — same issue as planner move-to-date, delegates to browser native datepicker."
  artifacts:
    - path: "src/renderer/expenses/ExpenseFilterBar.tsx"
      issue: "Lines 65-80: two <input type='date'> elements with native browser datepicker"
  missing:
    - "Replace native date inputs with shared DatePickerPopover component"
    - "Same solution as planner move-to-date — reusable component"

- truth: "Users can add new categories and manage categories section text is clearly visible"
  status: failed
  reason: "User reported: I cant add another category? also manage categories section and text is barely visible"
  severity: major
  test: 18
  root_cause: "CategoryManageView only supports editing/deleting — no onCreate prop or 'add new category' UI. The 'Manage categories' toggle button uses var(--color-text-muted) making it barely visible."
  artifacts:
    - path: "src/renderer/expenses/CategoryManageView.tsx"
      issue: "No onCreate prop, no add button/form — only edit + delete per existing category"
    - path: "src/renderer/expenses/ExpensesView.tsx"
      issue: "Toggle button uses var(--color-text-muted); createCategory not passed to CategoryManageView"
    - path: "src/renderer/expenses/InlineCategoryForm.tsx"
      issue: "Exists and works for inline creation in CategoryPicker — could be reused but isn't"
  missing:
    - "Add onCreate prop to CategoryManageView and '+ New Category' button"
    - "Reuse InlineCategoryForm component for inline category creation"
    - "Change toggle button color from var(--color-text-muted) to var(--color-text-secondary)"
