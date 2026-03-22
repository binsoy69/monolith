# Phase 4: Depth + Differentiators - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-22
**Phase:** 04-depth-differentiators
**Areas discussed:** Habit heatmap & history, Count-based habits, Task carry-forward, Expense charts

---

## Habit Heatmap & History Display

### Where should history/heatmap live?

| Option | Description | Selected |
|--------|-------------|----------|
| Expand-in-place | Click habit card to expand inline with history + mini heatmap | ✓ |
| Slide-over panel | Right-side panel with full history and stats | |
| Dedicated detail view | Full-screen view for the habit | |

**User's choice:** Expand-in-place
**Notes:** Keeps user on the main habits view, no navigation disruption.

### Heatmap color scale

| Option | Description | Selected |
|--------|-------------|----------|
| Single-color intensity | Accent color from transparent to saturated (GitHub style) | ✓ |
| Multi-color gradient | Cool-to-warm (blue → green → yellow) | |
| You decide | Match dark theme | |

**User's choice:** Single-color intensity

### Heatmap history range

| Option | Description | Selected |
|--------|-------------|----------|
| 90 days | Fits in expanded card without scrolling | ✓ |
| Full year | 365 cells, may need scroll or smaller cells | |

**User's choice:** 90 days

---

## Count-Based Habits

### How should count-based habits display and interact?

| Option | Description | Selected |
|--------|-------------|----------|
| Stepper buttons | `3/8` with `+`/`−` buttons replacing checkbox | |
| Progress ring | Circular progress replacing checkbox, click to increment | |
| Inline fraction | `3/8` text next to name, click card to increment | ✓ |

**User's choice:** Inline fraction only
**Notes:** Minimal UI change, consistent card layout with boolean habits.

---

## Task Carry-Forward Behavior

### When does carry-forward happen?

| Option | Description | Selected |
|--------|-------------|----------|
| On app open | Incomplete tasks from past days move to today on launch | ✓ |
| Midnight rollover | Background timer at midnight + on next open | |
| Manual only | Overdue indicator shown but tasks stay on original day | |

**User's choice:** On app open

### How are carried tasks distinguished?

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle accent border | Orange/amber left-stripe on the task row | ✓ |
| Grouped section header | "Carried Forward (3)" section above today's tasks | |
| Badge/tag with date | "from Mar 20" badge on each carried task | |

**User's choice:** Subtle accent left-border
**Notes:** Not grouped separately — carried tasks appear at top of today's list with the visual indicator.

---

## Expense Chart Styling & Layout

### Category breakdown chart type

| Option | Description | Selected |
|--------|-------------|----------|
| Donut chart | Ring with category slices, total in center | ✓ |
| Horizontal bar chart | Bars sorted by spending amount | |
| You decide | Whatever fits dense aesthetic | |

**User's choice:** Donut chart

### Where do charts live?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline in ExpensesView | Collapsible summary above expense list | ✓ |
| Separate Analytics tab | Tab within expenses module | |
| Top-level analytics | New sidebar section | |

**User's choice:** Inline collapsible section

### Trend line period

| Option | Description | Selected |
|--------|-------------|----------|
| All available data | Auto-scale from first expense to now | |
| Fixed 6 months | Always 6 months | |
| Toggleable 3/6/12 months | User-selectable period | ✓ |

**User's choice:** Toggleable 3/6/12 months

---

## Agent's Discretion

- Task priority visual treatment (P1/P2/P3)
- Overdue task indicator styling
- Exact chart color palette for expense charts
- Monthly spending totals layout

## Deferred Ideas

None — discussion stayed within phase scope
