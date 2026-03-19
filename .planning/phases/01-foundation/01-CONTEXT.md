# Phase 1: Foundation - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Electron app launches with a secure, correctly-architected shell — IPC bridge established, SQLite connected with migration runner, design token system defined, global keyboard router in place, and an app settings screen that persists preferences. No feature module UI — this is structural foundation only.

</domain>

<decisions>
## Implementation Decisions

### Color palette & typography
- Cool charcoal dark theme — blue-grey undertones (backgrounds in #1a1a2e to #16161e range, like Linear/Raycast)
- Electric/indigo blue accent color for interactive elements (active states, buttons, focus rings)
- Inter font family throughout — clean geometric sans-serif, good at small sizes
- Very dense UI — 12-13px base font size, 4px spacing grid, tight line height
- Maximum information per screen — power-user feel, Linear/Raycast density

### Shell layout
- Narrow icon-only sidebar (48-56px wide) on the left side
- Icons for Dashboard, Habits, Planner, Expenses; gear icon at bottom for Settings
- Tooltip on hover for icon labels
- Custom frameless window — no native titlebar, custom drag region at top, window controls integrated
- Minimal content header bar — thin bar with module name on left, 1-2 action buttons on right

### Settings screen
- Minimal essentials for Phase 1: date format (DD/MM vs MM/DD), notification reminder time
- Placeholder structure for future settings categories
- Accessed via gear icon at bottom of sidebar
- Single page with sections layout — all settings on one scrollable page, grouped by category
- Purpose: prove the electron-store persistence pattern works (SET-01)

### Keyboard conventions
- Alt-based modifier keys for module switching (leaves Ctrl free for text editing)
- Alt+1 = Dashboard, Alt+2 = Habits, Alt+3 = Planner, Alt+4 = Expenses
- ? = keyboard shortcut reference overlay (build in Phase 1 even with few shortcuts)
- Escape = close topmost overlay/modal; if nothing open, return to Dashboard
- Global keyboard router built into the shell — all shortcuts registered centrally before any module code

### Claude's Discretion
- Exact hex values for the color palette (within the cool charcoal + blue accent direction)
- Type scale specific sizes (within the 12-13px base constraint)
- Drag region height and window control placement
- Settings save behavior (auto-save vs explicit save button)
- Sidebar icon choices (which icon set, specific icons)
- Keyboard router implementation pattern (event delegation approach)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Core value, constraints, key decisions (Electron + React stack, local-only, dark dense aesthetic)
- `.planning/REQUIREMENTS.md` — Full v1 requirements; Phase 1 covers SHELL-03, SHELL-04, SHELL-05, SET-01
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, plan breakdown (01-01 through 01-05)

### Research
- `.planning/research/STACK.md` — Full technology stack with versions, alternatives considered, installation commands
- `.planning/research/ARCHITECTURE.md` — Two-process model, IPC data flow, build order dependencies
- `.planning/research/PITFALLS.md` — Critical pitfalls to avoid (contextBridge security, migration strategy, design tokens, keyboard router)
- `.planning/research/SUMMARY.md` — Executive summary, key findings, confidence flags

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — Phase 1 establishes all foundational patterns (IPC typing, design tokens, keyboard routing, state management)

### Integration Points
- electron-vite template will provide the initial project structure (main/preload/renderer split)
- better-sqlite3 native module needs electron-rebuild integration
- CSS custom properties define the design token contract consumed by all future module UI

</code_context>

<specifics>
## Specific Ideas

- Aesthetic references: Linear and Raycast for density and layout; cool charcoal with blue accent matches Linear's visual identity
- The app should feel like a power tool from the first launch — even the empty shell should look intentional and handcrafted, not like a starter template
- Inter font chosen for its readability at small sizes and association with premium dev tools

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-19*
