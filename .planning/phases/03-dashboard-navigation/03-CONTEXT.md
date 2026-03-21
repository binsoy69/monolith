# Phase 3: Dashboard + Navigation - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

The unified dashboard aggregates real data from all three modules into a single at-a-glance today view, and full keyboard navigation is operational across the entire app. A command palette enables quick-add from anywhere. No new module features — this phase wires existing data into the dashboard and completes the keyboard-driven experience.

</domain>

<decisions>
## Implementation Decisions

### Dashboard layout
- **D-01:** Stacked full-width cards — habits on top, tasks in middle, spending at bottom
- **D-02:** Habits card: "3/5 done" progress bar + 1-2 habits with notable streaks highlighted
- **D-03:** Tasks card: up to 3-5 incomplete tasks for today with titles, "2 remaining" count
- **D-04:** Spending card: "₱450 today" headline + top 2-3 categories with amounts
- **D-05:** Date header at top — "Friday, March 21" format, clean and informational, no greeting

### Dashboard interactions
- **D-06:** View-only dashboard — clicking a card navigates to that module
- **D-07:** Empty module state: card still shows with muted message ("No habits scheduled", "No tasks for today", "₱0 spent"). Card remains clickable
- **D-08:** Overdue tasks badge on the tasks card — "2 overdue" count in warning color if incomplete tasks exist from previous days

### Command palette (quick-add from anywhere)
- **D-09:** Ctrl+K opens a command palette with options: "Add task", "Log expense", "Check habit"
- **D-10:** Type-to-filter in the palette, Enter to select
- **D-11:** Selecting an action navigates to the module and focuses the add input / opens the modal — reuses existing module UIs, no duplicate forms
- **D-12:** "N" key behavior unchanged — still adds to active module (fast path). Ctrl+K is the cross-module path

### Keyboard accessibility
- **D-13:** Sidebar is NOT keyboard-focusable — Alt+1-4 is the keyboard path for module switching (already implemented)
- **D-14:** Focus indicators: 2px accent-colored ring on focused elements, using --color-accent token
- **D-15:** Tab cycles through interactive elements (buttons, inputs, checkboxes, cards) within the active module view. Context menus remain mouse-triggered
- **D-16:** `?` shortcut overlay updated with ALL shortcuts from Phases 1-3, grouped by category: Navigation, Module actions, Quick-add

### Claude's Discretion
- Command palette visual design (size, position, animation)
- Exact dashboard card spacing and styling within the stacked layout
- How many streak highlights to show in the habits card (1-2)
- How many incomplete tasks to show in the tasks card (3-5)
- How many category breakdowns to show in the spending card (2-3)
- Focus ring exact styling (offset, color opacity)
- Shortcut overlay categorization and grouping labels

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Core value, constraints, key decisions (Electron + React, local-only, dark dense aesthetic)
- `.planning/REQUIREMENTS.md` — Phase 3 covers SHELL-01, SHELL-02, KBD-01, KBD-02, KBD-03
- `.planning/ROADMAP.md` — Phase 3 goal, success criteria, plan breakdown (03-01 through 03-03)

### Prior phase context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Design tokens, shell layout, keyboard conventions, settings patterns
- `.planning/phases/02-module-core/02-CONTEXT.md` — Module interaction patterns, context menu conventions, "N" key behavior, data entry patterns

### Existing code references
- `src/shared/ipc-types.ts` — All module API interfaces (HabitsAPI, PlannerAPI, ExpensesAPI) — dashboard IPC handler will aggregate from these
- `src/renderer/App.tsx` — Shell layout with module switching, dashboard placeholder at line 84-104
- `src/renderer/shell/KeyboardRouter.tsx` — Global keyboard handler to extend with Ctrl+K
- `src/renderer/shell/KeyboardShortcutOverlay.tsx` — Shortcut reference to update with comprehensive shortcuts
- `src/renderer/shell/Sidebar.tsx` — Sidebar with active indicator (no keyboard focus changes needed)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `KeyboardRouter.tsx` — Global keyboard handler with input guard pattern (extend with Ctrl+K)
- `KeyboardShortcutOverlay.tsx` — Shortcut overlay modal (update with full shortcut list)
- `ModuleHeader.tsx` — Module header bar (reuse for dashboard header)
- `ErrorBoundary.tsx` — Module-level error boundaries (wrap dashboard)
- `ToastContainer.tsx` + `toast-store.ts` — Toast notification system (for any dashboard errors)
- Zustand stores: `habits-store.ts`, `planner-store.ts`, `expenses-store.ts` — existing module state

### Established Patterns
- IPC typed channels via `ipc-types.ts`, handlers in `src/main/ipc/`, preload bridge
- TanStack Query for server-state (IPC calls) with `staleTime` configuration
- CSS custom properties for all styling (`var(--color-*)`, `var(--space-*)`, etc.)
- Module switching via `activeModule` state in App.tsx with Sidebar and KeyboardRouter
- `newItemTrigger` counter pattern for triggering add actions from keyboard shortcuts

### Integration Points
- `App.tsx` line 84-104: Dashboard placeholder — replace with DashboardView component
- `KeyboardRouter.tsx`: Add Ctrl+K handler for command palette
- New IPC handler needed: aggregate today's data from habits, planner, expenses repositories
- New component: CommandPalette — mounted at app level (like KeyboardShortcutOverlay)
- New component: DashboardView — three summary cards with data from new dashboard IPC

</code_context>

<specifics>
## Specific Ideas

- Dashboard should feel like opening a command center — one glance tells you the state of your day
- Command palette inspired by Raycast/VS Code Ctrl+K — type to filter, instant response
- Overdue badge on tasks card provides gentle urgency without being alarming
- The dashboard is NOT a workspace — it's a summary. Actions happen in the modules

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-dashboard-navigation*
*Context gathered: 2026-03-21*
