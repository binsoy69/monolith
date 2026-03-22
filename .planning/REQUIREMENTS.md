# Requirements: Monolith

**Defined:** 2026-03-19
**Core Value:** Opening one app gives you a complete picture of your day — habits, tasks, spending — with zero friction to log anything.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Habits

- [x] **HAB-01**: User can create, edit, and archive habits
- [x] **HAB-02**: User can check off habits daily with a single click/keystroke
- [x] **HAB-03**: User can see current streak and best streak per habit
- [x] **HAB-04**: User can view completion history (last 7/30 days)
- [x] **HAB-05**: User can schedule habits for specific days of the week
- [x] **HAB-06**: User can reorder habits manually
- [x] **HAB-07**: User can view a GitHub-style completion heatmap per habit
- [x] **HAB-08**: User can track count-based habits with numerical targets (e.g. "8 glasses of water")
- [ ] **HAB-09**: User receives desktop notifications for unchecked habits

### Planner

- [x] **PLAN-01**: User can create tasks with a title and optional notes
- [x] **PLAN-02**: User can check off and delete tasks
- [x] **PLAN-03**: User can assign tasks to specific dates
- [x] **PLAN-04**: User can navigate between days (past and future)
- [x] **PLAN-05**: User can reorder tasks within a day
- [ ] **PLAN-06**: User can set priority levels (P1/P2/P3) on tasks
- [ ] **PLAN-07**: Unfinished tasks automatically carry forward to today
- [ ] **PLAN-08**: Overdue tasks display a visual indicator
- [x] **PLAN-09**: User can write freeform daily notes per day

### Expenses

- [x] **EXP-01**: User can log an expense with amount, date, and category
- [x] **EXP-02**: User can create custom expense categories
- [x] **EXP-03**: User can view expense history with filtering by date/category
- [ ] **EXP-04**: User can see monthly spending totals
- [ ] **EXP-05**: User can see spending breakdown by category (chart)
- [x] **EXP-06**: User can create wallets with balances
- [x] **EXP-07**: Logging an expense auto-deducts from the selected wallet
- [x] **EXP-08**: User can manually adjust wallet balances
- [x] **EXP-09**: User can add optional notes to expenses
- [ ] **EXP-10**: User can view spending trends over 6-12 months (line chart)

### Shell & UI

- [x] **SHELL-01**: Dashboard shows today's habits, tasks, and spending at a glance
- [x] **SHELL-02**: Sidebar navigation between dashboard and modules
- [x] **SHELL-03**: Dark, dense, information-rich UI (Raycast/Warp aesthetic)
- [x] **SHELL-04**: Sub-100ms transitions, no loading spinners
- [x] **SHELL-05**: Design feels handcrafted — not generic, not AI-generated

### Keyboard & UX

- [x] **KBD-01**: Full keyboard navigation across all modules
- [x] **KBD-02**: Quick-add shortcuts for tasks, expenses, and habit check-offs
- [x] **KBD-03**: Press `?` to view keyboard shortcut reference
- [ ] **KBD-04**: Global search across habits, tasks, expenses, and notes

### Tags & Cross-Module

- [ ] **TAG-01**: User can create and apply tags across all modules
- [ ] **TAG-02**: User can filter/view by tag across modules

### Settings

- [x] **SET-01**: App settings screen for preferences (notification times, date format)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Habits

- **HAB-10**: Streak freeze / grace period for missed days
- **HAB-11**: Habit categories / groups (morning routine, health, work)
- **HAB-12**: Habit notes per completion (log context like "ran 5km")

### Planner

- **PLAN-10**: Recurring tasks (daily/weekly auto-repeat)
- **PLAN-11**: Week view showing tasks across 7 days
- **PLAN-12**: Time blocking / time estimates per task

### Expenses

- **EXP-11**: Budget per category (set max, track actual vs budget)
- **EXP-12**: Recurring expenses (subscriptions auto-logged monthly)
- **EXP-13**: Daily spending limit / target

### Cross-Module

- **CROSS-01**: Data export to CSV/JSON
- **CROSS-02**: Quick capture global hotkey (log from anywhere without opening app)
- **CROSS-03**: Expense splits across multiple wallets

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Cloud sync / backend | Local-only by design — no accounts, no server |
| Mobile app | Desktop-only for v1 |
| Social features / sharing | No backend, single user |
| Bank sync / Plaid integration | Violates local-only constraint |
| Receipt OCR / photo scanning | Mobile-first feature, complex on desktop |
| AI suggestions / scheduling | Conflicts with fast, keyboard-driven identity |
| Plugin / extension system | Premature abstraction |
| Theme customization | One dark theme, done extremely well |
| Investment / debt tracking | Different domain entirely |
| Kanban / project management | Monolith is a daily tool, not a PM tool |
| Calendar integration (iCal/Google) | Requires internet and OAuth |
| Gamification (XP, badges, rewards) | Conflicts with power-tool aesthetic |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SHELL-03 | Phase 1 | Complete |
| SHELL-04 | Phase 1 | Complete |
| SHELL-05 | Phase 1 | Complete |
| SET-01 | Phase 1 | Complete |
| HAB-01 | Phase 2 | Complete |
| HAB-02 | Phase 2 | Complete |
| HAB-03 | Phase 2 | Complete |
| HAB-05 | Phase 2 | Complete |
| PLAN-01 | Phase 2 | Complete |
| PLAN-02 | Phase 2 | Complete |
| PLAN-03 | Phase 2 | Complete |
| PLAN-04 | Phase 2 | Complete |
| PLAN-05 | Phase 2 | Complete |
| PLAN-09 | Phase 2 | Complete |
| EXP-01 | Phase 2 | Complete |
| EXP-02 | Phase 2 | Complete |
| EXP-03 | Phase 2 | Complete |
| EXP-06 | Phase 2 | Complete |
| EXP-07 | Phase 2 | Complete |
| EXP-08 | Phase 2 | Complete |
| EXP-09 | Phase 2 | Complete |
| SHELL-01 | Phase 3 | Complete |
| SHELL-02 | Phase 3 | Complete |
| KBD-01 | Phase 3 | Complete |
| KBD-02 | Phase 3 | Complete |
| KBD-03 | Phase 3 | Complete |
| HAB-04 | Phase 4 | Complete |
| HAB-06 | Phase 4 | Complete |
| HAB-07 | Phase 4 | Complete |
| HAB-08 | Phase 4 | Complete |
| PLAN-06 | Phase 4 | Pending |
| PLAN-07 | Phase 4 | Pending |
| PLAN-08 | Phase 4 | Pending |
| EXP-04 | Phase 4 | Pending |
| EXP-05 | Phase 4 | Pending |
| EXP-10 | Phase 4 | Pending |
| TAG-01 | Phase 5 | Pending |
| TAG-02 | Phase 5 | Pending |
| KBD-04 | Phase 5 | Pending |
| HAB-09 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 40
- Unmapped: 0

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 after roadmap creation (traceability populated)*
