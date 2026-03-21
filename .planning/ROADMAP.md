# Roadmap: Monolith

## Overview

Five phases build Monolith from nothing to a shippable daily-driver desktop app. Phase 1 lays the structural foundation — Electron security model, SQLite migrations, design tokens, and keyboard router — before any feature code is written. Phase 2 gives each of the three modules a complete data entry loop. Phase 3 wires the unified dashboard and full keyboard navigation, validating the core product identity. Phase 4 adds the differentiating depth features (heatmaps, charts, carry-forward) that make the app worth opening every day. Phase 5 connects the modules through cross-cutting concerns (tags, global search, notifications) and prepares a distributable binary.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Electron shell, SQLite + migrations, design token system, keyboard router, app settings (completed 2026-03-19)
- [ ] **Phase 2: Module Core** - Minimum viable data entry loops for all three modules (habits, planner, expenses) (completed 2026-03-20, UAT gap closure in progress)
- [x] **Phase 3: Dashboard + Navigation** - Unified dashboard with real data, full keyboard navigation, sidebar complete (completed 2026-03-21)
- [ ] **Phase 4: Depth + Differentiators** - Charts, heatmaps, task carry-forward, habit scheduling, spending trends
- [ ] **Phase 5: Cross-Module + Distribution** - Tags, global search, desktop notifications, packaging, code signing

## Phase Details

### Phase 1: Foundation
**Goal**: The Electron app launches with a secure, correctly-architected shell — IPC bridge established, SQLite connected with migration runner, design token system defined, and a global keyboard router in place — so every subsequent phase builds on a sound foundation.
**Depends on**: Nothing (first phase)
**Requirements**: SHELL-03, SHELL-04, SHELL-05, SET-01
**Success Criteria** (what must be TRUE):
  1. The app launches as a desktop window with a dark, dense, clearly handcrafted UI — no generic grays, no placeholder chrome, no template-looking components
  2. Sub-100ms transitions are measurable — navigating between module slots produces no visible loading state
  3. The IPC bridge is operational — renderer can call typed channel functions and receive typed responses without accessing Node.js APIs directly
  4. SQLite database is created at the correct userData path with a migration runner that executes versioned migrations on startup
  5. An app settings screen exists and persists at least one preference (e.g., date format or notification time) across restarts
**Plans:** 4/4 plans complete

Plans:
- [x] 01-01-PLAN.md — Electron scaffolding, IPC bridge, SQLite + migrations, vitest setup
- [x] 01-02-PLAN.md — Design token system (globals.css), shell layout (Sidebar, WindowChrome, ModuleHeader, App.tsx)
- [ ] 01-03-PLAN.md — Settings screen with electron-store persistence, TanStack Query hooks, auto-save
- [ ] 01-04-PLAN.md — Global keyboard router (Alt+1-4, ?, Escape) and keyboard shortcut overlay modal

### Phase 2: Module Core
**Goal**: Each of the three modules has a complete, working data entry loop — a user can add, view, check off, and persist items in habits, planner, and expenses, with optimistic updates throughout.
**Depends on**: Phase 1
**Requirements**: HAB-01, HAB-02, HAB-03, HAB-05, PLAN-01, PLAN-02, PLAN-03, PLAN-04, PLAN-05, PLAN-09, EXP-01, EXP-02, EXP-03, EXP-06, EXP-07, EXP-08, EXP-09
**Success Criteria** (what must be TRUE):
  1. User can create, edit, and archive a habit; check it off today with a single click or keystroke; see the current streak increment immediately; and see the habit scheduled only on its assigned days of the week
  2. User can add a task with title and optional notes, assign it to a date, navigate to past and future days, reorder tasks within a day, check off a task, and write freeform notes for any day — all persisting across restarts
  3. User can log an expense with amount, date, category, optional notes, and a wallet selection; the wallet balance auto-deducts immediately; user can create custom categories, create and manually adjust wallets, and view an expense list filtered by date or category
  4. All write operations (habit check-off, task creation, expense logging) feel instantaneous — the UI updates before the IPC round-trip completes (optimistic updates)
  5. Each module is isolated — an error in the expense module does not crash the habit module or planner
**Plans:** 8/9 plans executed

Plans:
- [x] 02-01-PLAN.md — Shared infrastructure (IPC types, toast, context menu, error boundary) + habit backend + today view UI
- [x] 02-02-PLAN.md — Habit create/edit/archive flow, day-of-week scheduling, keyboard shortcut
- [x] 02-03-PLAN.md — Planner backend + task list UI with quick-add and date navigation
- [x] 02-04-PLAN.md — Planner task edit/delete, drag-and-drop reorder, daily notes, keyboard nav
- [x] 02-05-PLAN.md — Expense backend + wallet management UI with balance adjustment
- [x] 02-06-PLAN.md — Expense log modal, category management, expense list with filtering
- [x] 02-07-PLAN.md — [GAP] Design token fixes, text visibility, wallet form position, icon sizing, category creation
- [x] 02-08-PLAN.md — [GAP] Task click-to-expand notes in planner
- [x] 02-09-PLAN.md — [GAP] CalendarPopup component for planner date nav, move-to-date, expense filters

### Phase 3: Dashboard + Navigation
**Goal**: The unified dashboard aggregates real data from all three modules into a single at-a-glance today view, and full keyboard navigation is operational across the entire app.
**Depends on**: Phase 2
**Requirements**: SHELL-01, SHELL-02, KBD-01, KBD-02, KBD-03
**Success Criteria** (what must be TRUE):
  1. Opening the app shows today's habit completion status, task count (with overdue indicator), and daily spending total — all populated from real persisted data, not placeholders
  2. User can navigate from dashboard to any module and back using only keyboard (no mouse required)
  3. User can trigger quick-add for a task, expense, or habit check-off from anywhere in the app using a keyboard shortcut without navigating away from the current view
  4. Pressing `?` from anywhere in the app displays a keyboard shortcut reference overlay
  5. Sidebar navigation is fully functional and keyboard-accessible — active module is visually indicated
**Plans:** 2/2 plans complete

Plans:
- [x] 03-01-PLAN.md — Dashboard IPC handler + DashboardView UI with three summary cards (habits, tasks, spending)
- [x] 03-02-PLAN.md — Command palette (Ctrl+K), PlannerView newItemTrigger wiring, shortcut overlay update

### Phase 4: Depth + Differentiators
**Goal**: The app gains the features that make it genuinely preferred over three separate apps — visual history, behavioral patterns, automatic intelligence (carry-forward), and analytical depth.
**Depends on**: Phase 3
**Requirements**: HAB-04, HAB-06, HAB-07, HAB-08, PLAN-06, PLAN-07, PLAN-08, EXP-04, EXP-05, EXP-10
**Success Criteria** (what must be TRUE):
  1. User can view a GitHub-style completion heatmap for any habit showing the last year of check-off history, see completion history for last 7 and 30 days, manually reorder habits, and track count-based habits with a numerical target (e.g., "8 glasses of water")
  2. Unfinished tasks from previous days automatically appear at the top of today's task list; overdue tasks display a visible indicator; user can set P1/P2/P3 priority on any task
  3. User can view monthly spending totals, a spending-by-category breakdown chart, and a 6-12 month spending trend line chart
  4. All charts render with the same dark, dense aesthetic as the rest of the app — no default chart library styling visible
**Plans**: TBD

Plans:
- [ ] 04-01: Habit depth — completion history view (7/30 days), GitHub-style heatmap (Recharts SVG), manual reorder, count-based habits
- [ ] 04-02: Planner depth — task priority levels, carry-forward logic, overdue visual indicators
- [ ] 04-03: Expense depth — monthly totals, category breakdown chart, 6-12 month trend line chart

### Phase 5: Cross-Module + Distribution
**Goal**: Tags connect the three modules into a coherent system, global search makes accumulated data discoverable, desktop notifications close the habit loop, and the app ships as a signed distributable binary.
**Depends on**: Phase 4
**Requirements**: TAG-01, TAG-02, KBD-04, HAB-09
**Success Criteria** (what must be TRUE):
  1. User can create a tag and apply it to habits, tasks, and expenses; filtering by that tag shows matching items across all three modules in a unified view
  2. User can invoke global search (keyboard shortcut) and find matching habits, tasks, expenses, and notes by keyword — results appear instantly as they type
  3. User receives a desktop notification for habits that have not been checked off (at a time configured in settings); clicking the notification focuses the habit module
  4. The app installs and runs as a signed native binary on the target platform; auto-update checks GitHub Releases on startup
**Plans**: TBD

Plans:
- [ ] 05-01: Tags system — schema, IPC handlers, tag UI on all three modules, cross-module filter view
- [ ] 05-02: Global search — IPC handler with full-text search across all module tables, search UI with keyboard navigation
- [ ] 05-03: Desktop notifications — node-cron scheduler in main process, habit notification logic, notification click handler
- [ ] 05-04: Packaging and distribution — electron-builder config, code signing, auto-updater wired to GitHub Releases

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete   | 2026-03-19 |
| 2. Module Core | 9/9 | Complete   | 2026-03-21 |
| 3. Dashboard + Navigation | 2/2 | Complete   | 2026-03-21 |
| 4. Depth + Differentiators | 0/3 | Not started | - |
| 5. Cross-Module + Distribution | 0/4 | Not started | - |
