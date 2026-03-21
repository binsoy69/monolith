# Phase 3: Dashboard + Navigation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-21
**Phase:** 03-dashboard-navigation
**Areas discussed:** Dashboard layout, Dashboard interactions, Quick-add shortcuts, Keyboard accessibility

---

## Dashboard Layout

### Layout arrangement

| Option | Description | Selected |
|--------|-------------|----------|
| Stacked cards | Three full-width cards stacked vertically — habits top, tasks middle, spending bottom | ✓ |
| Grid cards | Habits and tasks side-by-side top row, spending full-width below | |
| Single column list | Ultra-dense, no cards, just section headers with inline data | |

**User's choice:** Stacked cards
**Notes:** Fits the narrow content area well, dense and scannable

### Habits card data

| Option | Description | Selected |
|--------|-------------|----------|
| Progress + streak highlights | "3/5 done" progress bar + 1-2 habits with notable streaks | ✓ |
| Full habit list with checkboxes | All today's habits with check-off state | |
| Progress bar only | Just "3/5 habits completed" with visual bar | |

**User's choice:** Progress + streak highlights
**Notes:** Compact and motivational

### Tasks card data

| Option | Description | Selected |
|--------|-------------|----------|
| Incomplete task list | Up to 3-5 incomplete tasks with titles, "2 remaining" count | ✓ |
| Count only | Just "2/5 done" with progress indicator | |
| All tasks with status | All tasks (complete + incomplete) with checkboxes | |

**User's choice:** Incomplete task list

### Spending card data

| Option | Description | Selected |
|--------|-------------|----------|
| Today's total + category breakdown | "₱450 today" headline + top 2-3 categories with amounts | ✓ |
| Today's total only | Just the total spent today | |
| Total + recent transactions | Today's total plus last 2-3 expense entries | |

**User's choice:** Today's total + category breakdown

---

## Dashboard Interactions

### Interactivity level

| Option | Description | Selected |
|--------|-------------|----------|
| View-only, click navigates | Dashboard is read-only summary, clicking card navigates to module | ✓ |
| Interactive — check off from dashboard | Check off habits and tasks directly on dashboard | |
| Mixed | Habits checkable, tasks/expenses navigate on click | |

**User's choice:** View-only, click navigates
**Notes:** Keeps dashboard simple, avoids duplicating module logic

### Empty states

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle empty message | Card shows with muted message, still clickable | ✓ |
| Hide empty cards | Card doesn't render if no data | |
| Empty + call to action | Empty card with action prompt | |

**User's choice:** Subtle empty message

### Date header

| Option | Description | Selected |
|--------|-------------|----------|
| Date header only | "Friday, March 21" — clean, informational | ✓ |
| Greeting + date | "Good morning" + date | |
| No header | Cards start immediately | |

**User's choice:** Date header only

### Overdue indicator

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, badge on tasks card | "2 overdue" count in warning color on tasks card | ✓ |
| No — just today's tasks | Dashboard only shows today, overdue in Phase 4 | |
| Separate overdue section | Dedicated section above regular cards | |

**User's choice:** Yes, badge on tasks card

---

## Quick-add Shortcuts

### Quick-add mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Command palette | Ctrl+K opens palette with "Add task", "Log expense", "Check habit" | ✓ |
| Dedicated shortcut per module | Ctrl+T/E/H for each module directly | |
| Keep N for active module only | No cross-module quick-add | |

**User's choice:** Command palette

### Palette shortcut key

| Option | Description | Selected |
|--------|-------------|----------|
| Ctrl+K | Industry standard (VS Code, Linear, Raycast) | ✓ |
| Ctrl+Space | Common IDE autocomplete shortcut | |
| Ctrl+P | VS Code file search shortcut | |

**User's choice:** Ctrl+K

### Palette action flow

| Option | Description | Selected |
|--------|-------------|----------|
| Navigate + focus | Switches to module, focuses add input/opens modal | ✓ |
| Inline in palette | Palette becomes input form, no navigation | |
| Floating modal | Standalone quick-add modal over current view | |

**User's choice:** Navigate + focus

### N key behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Keep both | N for active module, Ctrl+K for cross-module | ✓ |
| Replace N with Ctrl+K | All quick-add through palette | |
| N opens palette | Repurpose N to open command palette | |

**User's choice:** Keep both

---

## Keyboard Accessibility

### Sidebar keyboard focus

| Option | Description | Selected |
|--------|-------------|----------|
| Tab + arrows | Tab into sidebar, arrows between items | |
| Alt+1-4 only | Sidebar not keyboard-focusable, Alt+1-4 is the path | ✓ |
| Tab through everything | Tab cycles through sidebar buttons | |

**User's choice:** Alt+1-4 only

### Focus indicators

| Option | Description | Selected |
|--------|-------------|----------|
| Accent ring | 2px accent-colored ring using --color-accent | ✓ |
| Subtle outline | Thin 1px outline in muted color | |
| You decide | Claude picks | |

**User's choice:** Accent ring

### Keyboard navigation depth

| Option | Description | Selected |
|--------|-------------|----------|
| Tab to interactive elements | Tab cycles through buttons, inputs, checkboxes, cards | ✓ |
| Full arrow-key navigation | Arrow keys navigate lists, Enter to select, Shift+F10 for context menu | |
| Minimal — inputs only | Tab only reaches inputs and buttons | |

**User's choice:** Tab to interactive elements

### Shortcut overlay update

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, comprehensive update | All Phase 1-3 shortcuts, grouped by category | ✓ |
| Minimal — just add Ctrl+K | Only new command palette shortcut | |

**User's choice:** Yes, comprehensive update

---

## Claude's Discretion

- Command palette visual design (size, position, animation)
- Exact dashboard card spacing and styling
- Streak highlight count (1-2), task preview count (3-5), category breakdown count (2-3)
- Focus ring exact styling
- Shortcut overlay categorization labels

## Deferred Ideas

None — discussion stayed within phase scope
