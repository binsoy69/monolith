# Phase 2: Module Core - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Each of the three modules (habits, planner, expenses) has a complete, working data entry loop — a user can add, view, check off, and persist items with optimistic updates throughout. Dashboard and cross-module features are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Habit check-off view
- Card-based layout — each habit gets its own card
- Card shows: habit name, custom rounded checkbox, current streak count, best streak count (e.g., "Current: 7 days | Best: 14 days")
- Hide streak display entirely when streak is zero (both current and best)
- Check-off feedback: checkbox fills with accent color + brief subtle card highlight animation
- Checked-off cards reduce to dimmed/lower opacity
- Clicking anywhere on the habit card toggles check-off (entire card is the click target)
- Uncheck action: brief reverse animation (opacity restores, card briefly pulses)
- Show ALL active habits every day — unscheduled habits are dimmed and non-interactive (cannot check off)
- Ordering: unchecked habits first, checked habits sink to bottom
- Progress summary at top of habit list: "3/5 completed"
- Streaks calculated by consecutive SCHEDULED days only (missing an unscheduled day doesn't break the streak)

### Habit create/edit/archive
- "+" button in the ModuleHeader bar opens an inline expandable form at the top of the card list
- Same inline form used for both create and edit (pre-filled with current values on edit)
- Schedule picker: checkbox row with day labels (Mon, Tue, Wed, etc.)
- Edit and archive actions accessed via right-click context menu on the habit card
- Archiving requires a brief inline confirmation prompt
- Archived habits hidden completely from today view
- Toggle in ModuleHeader to switch between active and archived habits views
- Empty state: centered "No habits yet" message with a prominent "Create your first habit" button

### Planner day view
- Tabs in ModuleHeader: Tasks | Notes — date navigation on the left, tabs on the right, all in one bar
- Date navigation: left/right arrow buttons flanking the current date label
- "Today" label gets a subtle accent highlight when viewing the current day; other days show plain date
- Task count in date header: "2/5 done" format
- Quick-add text input persistently visible at the top of the task list — type title, press Enter to add
- Quick-add has a small inline date picker icon — defaults to the currently viewed day, changeable before adding
- Task rows: compact — checkbox on left, title text. No inline notes preview
- Task editing: right-click context menu → "Edit" expands an inline form below the row with title + notes fields
- Task reordering: drag and drop with drag handles
- Completed tasks: strikethrough text + dimmed opacity, sink to bottom of list (always visible, not collapsible)
- Task deletion: via context menu, with brief inline confirmation
- Move task to different date: context menu → "Move to date" with date picker
- Context menu items: Edit, Move to date, Delete (no Duplicate)
- Empty day: centered "No tasks for today" message with the quick-add input still visible at top

### Planner daily notes
- Plain textarea (no markdown, no rich text)
- Auto-save with debounce (~500ms) — matches settings auto-save pattern from Phase 1
- Accessed via the "Notes" tab in the ModuleHeader

### Planner keyboard navigation
- Left/right arrow keys navigate between days (when task list is focused, no input active)
- "T" key (when not in an input) jumps back to today's date

### Expense module structure
- Layout: wallets sidebar panel on the left, expense list on the right — both always visible
- Total balance across all wallets shown at top of wallet sidebar
- Wallet cards with action buttons (edit, adjust balance)
- Balance adjustment: two options — "Set balance" (enter new total) and "Add/Subtract" (enter +/- amount)
- Wallet deletion blocked if wallet has linked expenses
- "+" button in ModuleHeader opens a modal/overlay form for logging an expense

### Expense logging form
- Modal form fields: amount (with ₱ prefix), date (defaults to today), category dropdown, wallet dropdown, optional notes
- Currency: hardcoded Philippine Peso (₱) — no currency setting
- Category picker: dropdown with "+" New category" option at bottom for inline creation
- Wallet is REQUIRED for every expense (no unassigned expenses)
- Form does NOT remember last used category/wallet — always starts fresh
- Amount display: hide decimals when .00 (show ₱150 not ₱150.00, but show ₱150.50)

### Expense list and filtering
- Flat chronological list, most recent first — each row shows date, amount, category (with color dot), wallet, notes indicator
- Persistent filter bar above the list: date range picker + category dropdown, clear filter button
- Edit/delete via right-click context menu — edit reopens the modal pre-filled, editing reverses original wallet deduction and applies new one
- Delete with brief confirmation, reverses wallet deduction

### Expense categories
- Categories have colors — preset palette of 8-12 colors for selection on creation
- Pre-populated default categories (Food, Transport, Bills, Entertainment, etc.) on first run
- Category management section within the expense module (gear/manage link) — rename, recolor, delete
- Category deletion blocked if in use by expenses

### Expense empty state
- If no wallets exist: prompt "Create your first wallet" before allowing expense logging (since wallet is required)
- If wallets exist but no expenses: standard "Log your first expense" prompt

### Data entry patterns (shared)
- All modules use right-click context menus for edit/delete actions — consistent pattern
- All destructive actions use the same inline confirmation prompt style
- Optimistic updates with brief subtle indicator (shimmer/opacity) while IPC call is in flight
- IPC errors communicated via toast notifications
- "N" key (when not in an input) triggers add action for the current module (habits: inline form, planner: focus quick-add, expenses: open modal)
- Shared toast notification system mounted at app level, toasts appear bottom-right, auto-dismiss
- Separate Zustand store per module (habits-store.ts, planner-store.ts, expenses-store.ts)

### Claude's Discretion
- Exact card dimensions, spacing, and shadow values for habit cards
- Specific drag-and-drop library choice for task reordering
- Toast auto-dismiss duration
- Exact shimmer/opacity animation timing for optimistic updates
- Specific default category names and their preset colors
- Filter bar date range picker implementation details
- Context menu styling and positioning
- Wallet sidebar width
- Modal form sizing and positioning

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Core value, constraints, key decisions (Electron + React, local-only, dark dense aesthetic)
- `.planning/REQUIREMENTS.md` — Full v1 requirements; Phase 2 covers HAB-01 through HAB-05, PLAN-01 through PLAN-05 + PLAN-09, EXP-01 through EXP-03 + EXP-06 through EXP-09
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, plan breakdown (02-01 through 02-06)

### Prior phase context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Design tokens, shell layout, keyboard conventions, settings patterns established in Phase 1

### Research (from Phase 1)
- `.planning/research/STACK.md` — Technology stack (Zustand, TanStack Query, Tailwind, better-sqlite3, Drizzle ORM, Recharts)
- `.planning/research/ARCHITECTURE.md` — Two-process model, IPC data flow
- `.planning/research/PITFALLS.md` — Critical pitfalls (contextBridge, migration strategy, timezone handling for streaks)

### Existing code
- `src/shared/domain-types.ts` — Habit, Task, Category, Wallet, Expense type definitions (already defined)
- `src/shared/ipc-types.ts` — API interface with stubs for Phase 2 module APIs
- `src/main/db/migrations.ts` — SQLite schema (all tables already created in migration v1)
- `src/renderer/App.tsx` — Shell layout with module switching, placeholder for Phase 2 module views

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/renderer/shell/Sidebar.tsx` — Navigation sidebar with module switching (already handles habits/planner/expenses icons)
- `src/renderer/shell/ModuleHeader.tsx` — Module header bar (can be extended with "+" buttons, tabs, date nav per module)
- `src/renderer/shell/KeyboardRouter.tsx` — Global keyboard handler (extend with "N" and "T" shortcuts)
- `src/renderer/shell/KeyboardShortcutOverlay.tsx` — Shortcut reference modal (update with new Phase 2 shortcuts)
- `src/renderer/settings/useSettings.ts` — TanStack Query hook pattern for IPC-as-server-state (reuse pattern for module data)
- `src/main/ipc/settings.ts` — IPC handler pattern (replicate for habits, planner, expenses handlers)
- `src/main/db/connection.ts` — SQLite connection with migration runner

### Established Patterns
- IPC: typed channels via `ipc-types.ts`, handlers in `src/main/ipc/`, preload bridge in `src/preload/index.ts`
- State: TanStack Query for server-state (IPC calls), Zustand for client-state (UI state)
- Styling: CSS custom properties (`var(--color-*)`, `var(--font-size-*)`, etc.) — no component libraries
- Auto-save: 500ms debounce pattern (used in settings, reuse for daily notes)
- Settings: `staleTime: Infinity` for data that doesn't change externally

### Integration Points
- `App.tsx` line 41-53: Module content area renders placeholder — replace with module components based on `activeModule`
- `ipc-types.ts` line 21-24: Commented stubs for `habits`, `planner`, `expenses` APIs — uncomment and define
- `domain-types.ts`: All types defined but may need extension (e.g., Habit needs `position` field for ordering)
- `migrations.ts`: All tables exist; habits table already has `position` column
- `KeyboardRouter.tsx`: Add "N" (new item) and "T" (today) shortcuts to the handler

</code_context>

<specifics>
## Specific Ideas

- Habit cards should feel substantial but not heavy — subtle shadows, accent color on check-off, dimmed when done
- The planner should feel like a focused daily tool — one day at a time, quick-add is king
- Expense logging should feel fast but deliberate — modal form (not inline) because expenses need more fields
- Context menus throughout for a desktop-native feel — right-click is a power-user pattern that fits the aesthetic
- Philippine Peso (₱) hardcoded — this is a personal tool, not a multi-currency app
- "N for new" across all modules — keyboard-first identity established in Phase 1 carries forward

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-module-core*
*Context gathered: 2026-03-20*
