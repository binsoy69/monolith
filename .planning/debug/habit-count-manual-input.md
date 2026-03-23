# Debug Session: Habit Count Manual Input

## Symptom

User expected a count-based habit to support direct manual value entry for large measured targets such as `1000 mL`, but the UI only supports stepwise updates.

## Root Cause

Count habits only support increment and reset operations after creation. There is no UI control, store action, or IPC bridge method for directly setting a numeric progress value.

## Evidence

- `src/renderer/habits/HabitCard.tsx` renders count habits as a single button displaying `todayValue/targetCount`.
- `src/renderer/habits/habits-store.ts` implements `incrementCount` and `resetCount`, but no `setCount` or `updateProgress` path.
- `src/shared/ipc-types.ts` exposes `incrementCount` and `resetCount` only.

## Files Involved

- `src/renderer/habits/HabitCard.tsx`
- `src/renderer/habits/habits-store.ts`
- `src/shared/ipc-types.ts`

## Fix Direction

Introduce a direct value-entry affordance for count habits and back it with a dedicated store and IPC mutation for setting arbitrary progress values.
