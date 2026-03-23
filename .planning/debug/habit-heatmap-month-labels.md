# Debug Session: Habit Heatmap Month Labels

## Symptom

Heatmap month labels around boundaries such as `Dec` and `Jan` render with bad spacing or otherwise appear buggy, even though the heatmap cells and history summaries load.

## Root Cause

Month labels are derived from day-level month transitions, but they are rendered on week-column coordinates. The current implementation does not dedupe or resolve collisions when two transitions land in the same or adjacent columns.

## Evidence

- `src/renderer/habits/HabitHeatmap.tsx` pushes a month label whenever `point.date.slice(0, 7)` changes.
- The rendered label position is `Math.floor(index / ROWS)`, so multiple day transitions can collapse into the same visual column.
- Labels are absolutely positioned with no spacing, hiding, or merge rule.

## Files Involved

- `src/renderer/habits/HabitHeatmap.tsx`

## Fix Direction

Generate labels from the rendered weekly grid, then merge, skip, or offset labels that would collide.
