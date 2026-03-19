# Monolith

## What This Is

A desktop productivity app that unifies habit tracking, daily planning, and expense management into a single dark, information-dense interface. Built with Electron + React, it's a personal command center for managing your day — fast, keyboard-driven, and designed to feel like a power tool, not a toy.

## Core Value

Opening one app in the morning gives you a complete picture of your day — habits to maintain, tasks to complete, money to manage — with zero friction to log anything.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Dashboard showing today's habits, tasks, and spending at a glance
- [ ] Habit tracker with daily checkboxes, streak counts, and completion charts
- [ ] Daily planner with task lists and checkoff
- [ ] Expense tracker with amount, category, date logging
- [ ] Monthly expense summaries with category breakdowns and charts
- [ ] Wallets with balances (auto-deduct on expense, manual adjustments)
- [ ] Daily notes — freeform text area per day
- [ ] Tags/labels across all modules (habits, tasks, expenses)
- [ ] Keyboard-driven navigation and data entry shortcuts
- [ ] Desktop notifications for unchecked habits
- [ ] Dark, dense UI — information-rich, dev-tool aesthetic (Raycast/Warp style)
- [ ] Polished visual design — not generic, not AI-looking
- [ ] Instant performance — no loading spinners, snappy transitions, fast data entry

### Out of Scope

- Cloud sync — local-only storage (SQLite), no backend
- Mobile app — desktop only for v1
- OAuth/social login — no accounts, it's a local app
- Real-time collaboration — single user
- Recurring tasks — deferred to v2
- Quick capture global hotkey — deferred to v2
- Data export (CSV/JSON) — deferred to v2
- Expense splits across wallets — deferred to v2

## Context

- Desktop app built with Electron and React
- All data stored locally in SQLite — no server, no internet required
- Three modules (habits, planner, expenses) share a shell but are mostly independent
- Dashboard is the entry point, with sidebar navigation to each module
- The user values speed above all — both UI responsiveness and interaction speed
- Design must feel handcrafted: strong typography, intentional density, not template-driven

## Constraints

- **Platform**: Electron + React — web tech in a desktop shell
- **Storage**: SQLite local-only — no cloud, no sync
- **Design**: Dark theme, dense layout, dev-tool aesthetic — must not look generic or AI-generated
- **Performance**: Sub-100ms transitions, instant data entry feedback

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Electron + React | User's chosen stack, familiar web tech | — Pending |
| SQLite local storage | No server complexity, works offline, fast queries | — Pending |
| Shared shell, independent modules | Simpler architecture, modules don't need to sync data | — Pending |
| Dark + dense aesthetic | User preference, aligns with power-user identity | — Pending |
| Keyboard-first design | Speed priority, reduces friction for daily use | — Pending |

---
*Last updated: 2026-03-19 after initialization*
