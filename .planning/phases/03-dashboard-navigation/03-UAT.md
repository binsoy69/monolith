---
status: diagnosed
phase: 03-dashboard-navigation
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md]
started: 2026-03-21T00:00:00Z
updated: 2026-03-21T00:01:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Dashboard Date Header
expected: Navigate to the Dashboard module (Alt+1). The top of the view shows today's date formatted as "Saturday, March 21" (day-of-week, month day).
result: pass

### 2. Habits Card Display
expected: The Habits card shows a progress bar indicating how many habits are done for today (e.g. "2/5 done"), with a thin accent-colored bar. If you have habits with active streaks, up to 2 streak highlights appear below in accent color.
result: pass

### 3. Habits Card Navigation
expected: Clicking the Habits card (or pressing Enter/Space when focused) navigates to the Habits module.
result: pass

### 4. Tasks Card Display
expected: The Tasks card shows up to 5 of today's incomplete tasks. If there are more than 5, a "N remaining" label appears. If any tasks are overdue (from previous days), an overdue badge appears with a warm/amber color.
result: pass

### 5. Spending Card Display
expected: The Spending card shows today's total spending formatted in pesos (e.g. "₱150.00"). Below the total, up to 3 category rows appear with colored dots and individual amounts. If no spending today, shows "₱0 spent today".
result: issue
reported: "Peso sign renders as literal text \u20b1 instead of the ₱ symbol"
severity: major

### 6. Dashboard Empty States
expected: If you have no habits scheduled for today, the Habits card shows "No habits scheduled today". If no tasks, Tasks card shows "No tasks for today". If no spending, Spending card shows "₱0 spent today".
result: issue
reported: "Spending card shows literal text \u20B1 instead of the ₱ symbol"
severity: major

### 7. Command Palette Open/Close
expected: Press Ctrl+K from anywhere in the app. A centered overlay (command palette) appears with a search input, backdrop behind it. Press Escape to close it. It should also close when clicking outside the palette.
result: pass

### 8. Command Palette Filter and Execute
expected: With the command palette open, type "task". The list filters to show "Add task". Press Enter (or click it). The app navigates to the Planner module and focuses the quick-add input field.
result: pass

### 9. Command Palette Keyboard Navigation
expected: Open command palette (Ctrl+K). Use Arrow Down/Up to move through the action list. The active item highlights. Press Enter to execute the highlighted action.
result: pass

### 10. Shortcut Overlay Updated
expected: Press "?" to open the keyboard shortcut overlay. It shows three sections: Navigation (Alt+1-4, Esc), Module Actions (N, arrows, T), and Quick-Add (Ctrl+K, ?, arrows, Enter).
result: issue
reported: "When app is not fullscreen, keyboard shortcut overlay is cut off at the bottom because it is too long"
severity: minor

## Summary

total: 10
passed: 7
issues: 3
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Spending card displays peso amounts with ₱ symbol"
  status: fixed
  reason: "User reported: Peso sign renders as literal text \\u20b1 instead of the ₱ symbol"
  severity: major
  test: 5
  root_cause: "\\u20B1 escape in JSX text node is not interpreted — JSX treats it as literal text, not a JS string"
  artifacts:
    - path: "src/renderer/dashboard/SpendingCard.tsx"
      issue: "Unicode escape in JSX text node on line 73"
  missing:
    - "Use formatPeso(0) instead of literal \\u20B1 in JSX"

- truth: "Empty state spending card shows ₱0 spent today with proper peso symbol"
  status: fixed
  reason: "User reported: Spending card shows literal text \\u20B1 instead of the ₱ symbol"
  severity: major
  test: 6
  root_cause: "Same root cause as test 5 — single code location"
  artifacts:
    - path: "src/renderer/dashboard/SpendingCard.tsx"
      issue: "Unicode escape in JSX text node on line 73"
  missing: []

- truth: "Keyboard shortcut overlay fits within the viewport without clipping"
  status: fixed
  reason: "User reported: When app is not fullscreen, keyboard shortcut overlay is cut off at the bottom because it is too long"
  severity: minor
  test: 10
  root_cause: "Modal content div has no max-height constraint or overflow scrolling"
  artifacts:
    - path: "src/renderer/shell/KeyboardShortcutOverlay.tsx"
      issue: "Missing maxHeight and overflowY on modal content div"
  missing:
    - "Add maxHeight: 80vh and overflowY: auto to modal content"
