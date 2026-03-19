# Feature Landscape

**Domain:** Desktop productivity app — habit tracking + daily planning + expense management
**Project:** Monolith
**Researched:** 2026-03-19
**Confidence note:** Web search and WebFetch were unavailable during this session. All findings draw from training data (knowledge cutoff August 2025) on apps including Streaks, Habitica, HabitNow, Notion, Things 3, Todoist, OmniFocus, YNAB, Copilot, Actual Budget, Money Manager, and Obsidian. Confidence is MEDIUM across the board — no live verification was possible.

---

## Module 1: Habit Tracker

### Table Stakes

Features every habit tracker must have. Missing any one causes users to reach for a dedicated app instead.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Daily habit list with checkbox | Core interaction loop — check off today's habits | Low | The fundamental unit. Every habit tracker has this. |
| Streak counter per habit | The primary motivator; users come back for streaks | Low | Show current streak + best streak. Missing this feels broken. |
| Completion rate / history | Users need to see if habits are actually sticking | Medium | At minimum: last 7 or 30 days grid view |
| Habit scheduling (daily / specific days) | Not all habits are every day | Low | "Mon/Wed/Fri gym" is extremely common. Without this, the tracker is useless for selective habits. |
| Mark incomplete (undo check) | Fat-finger correction, timezone crossover | Low | Must support unchecking today's habit |
| Add / edit / archive habit | CRUD — obviously required | Low | Archive (not delete) preserves history |
| Habit ordering / reorder | Users sort by priority, time-of-day | Low | Drag-to-reorder or manual ordering |
| Today view | Which habits are due today | Low | The primary daily entry point |

### Differentiators

Features that make habit trackers competitive but are not expected by default.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Streak freeze / grace period | One miss doesn't kill momentum — reduces churn | Medium | Streaks, Duolingo use this. Users love it. |
| Habit categories / groups | Users have morning routine, health, work blocks | Low | Tags or folders. Improves scanability in dense UI. |
| Completion charts (calendar heatmap) | GitHub-style visualization is deeply satisfying | Medium | The "GitHub contributions" view for habits. High visual impact. |
| Habit notes per completion | Log "ran 5km" vs just checking a box | Medium | Adds richness, especially for journal-style habits |
| Multiple completions per day (count habits) | "Drink 8 glasses of water" — not boolean | Medium | Numerical target per day. Distinct from binary habits. |
| Completion time logging | Automatically records when you checked in | Low | Useful for analytics. Helps identify patterns. |
| Week/month summary view | Step back from daily grind | Medium | Aggregated view across all habits for a time range |
| Desktop notifications at a specific time | Habit reminders tied to schedule | Medium | Electron makes this feasible. Ties into planner module. |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Social/friend streaks | Adds backend, accounts, complexity — against local-only constraint | Ignore entirely. Local app has no social graph. |
| Gamification (XP, rewards, badges) | Habitica owns this niche. Toyish aesthetic conflicts with Monolith's power-tool feel. | Use data density + streak numbers as the "game" |
| AI habit suggestions | Gimmicky, requires internet, users don't trust AI to know their life | Let users define their own habits |
| Habit "difficulty" ratings | Gamification layer that adds clutter | Not needed in a dense, serious tool |
| Sub-habits / nested habits | Collapses into task management territory | Keep habits as atomic behaviors |

---

## Module 2: Daily Planner

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Task list for today | Core daily planning — what am I doing today? | Low | The fundamental unit. |
| Task creation with title | CRUD — obviously required | Low | Keyboard shortcut to add is critical for Monolith |
| Task completion (check off) | Mark done — the satisfaction loop | Low | With undo support |
| Task deletion | Remove tasks that are no longer relevant | Low | — |
| Date assignment | Tasks belong to a specific day | Low | Navigate to yesterday, next week, etc. |
| View by date (day navigation) | Past and future task planning | Low | Back/forward arrows to navigate days |
| Task ordering / reorder | Priority ordering within a day | Low | Manual ordering, not AI-sorted |
| Task notes / description | Add context to a task | Medium | Optional detail field per task |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Quick-add keyboard shortcut | Zero-friction capture — core to speed-first design | Low | `N` or `/` or `Cmd+N` — must feel instant |
| Priority levels (P1/P2/P3 or color) | Users have urgent vs important distinction | Low | Simple 3-tier is enough. Avoids over-engineering. |
| Task carry-forward (roll unfinished tasks to today) | Missed yesterday's task → surfaces automatically | Medium | YNAB-style "roll with the punches." High value, medium complexity. |
| Recurring tasks | Weekly review, daily standup — these happen every week | High | Deferred to v2 per PROJECT.md. Hard to implement correctly. |
| Time blocking / time estimates | "This task takes 30 min" — helps planning | Medium | Optional field. Simple display in day view. |
| Daily notes (freeform text) | Scratchpad per day — log thoughts, meetings | Low | One text area per day. PROJECT.md already calls this out. |
| Tags across tasks | "work", "personal", "urgent" — cross-cutting | Medium | PROJECT.md calls this out. Filter/group by tag. |
| Overdue indicator | Tasks from past days that weren't completed | Low | Red badge or separate "overdue" section |
| Week view | See the whole week laid out | Medium | Plan ahead, not just today |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Sub-tasks / nested tasks | OmniFocus territory. Endless nesting complexity, conflicts with dense UI. | Flat task list. Notes field handles details. |
| Project hierarchy | Too much structure — becomes a project manager | Monolith is a daily planner, not a PM tool |
| Dependencies between tasks | "Task B starts after Task A" — project management territory | Not needed for personal daily planning |
| Kanban board view | Adds surface area; trello/linear own this | Stick to list view — it's faster to scan |
| Calendar integration (iCal/Google Cal sync) | Requires internet and OAuth — against local constraint | Manual time blocking is sufficient |
| AI task scheduling | Unreliable, requires LLM, erodes user trust | Users know their own schedules |

---

## Module 3: Expense Tracker

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Log expense (amount, date, category) | Core interaction — record a spend | Low | The fundamental unit. Must be fast — 3 fields, press enter. |
| Category assignment | Without categories, expenses are unanalyzable | Low | Predefined categories + custom categories |
| Expense list / history | View all logged expenses | Low | Filterable by date range, category |
| Edit / delete expense | Correction flow | Low | Fat-finger on amount is common |
| Monthly total | How much did I spend this month? | Low | Summary number, not just raw list |
| Spending by category breakdown | Where is the money going? | Medium | Bar chart or table. The core insight. |
| Wallet / account tracking | "Is this from checking or credit card?" | Medium | PROJECT.md already has wallets with balances. |
| Balance auto-deduction | Wallet balance decreases when expense logged | Low | Derived from wallet feature. Core behavior. |
| Date navigation | View past months | Low | Go back to last month's expenses |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Manual balance adjustment | "I deposited $500" — not just deductions | Low | PROJECT.md calls this out. Simple +/- ledger entry. |
| Budget per category | "I want to spend max $200 on dining" | Medium | Compare actual vs budget. Green/red indicator. Very high value. |
| Spending trends over time | Am I spending more this month vs last? | Medium | Line chart: monthly spending over 6-12 months |
| Visual calendar of spending | Day-by-day view of when money was spent | Medium | Heatmap or dot-on-calendar. Interesting pattern view. |
| Quick-add expense shortcut | Same speed-first philosophy as task entry | Low | Single keyboard shortcut to open expense form |
| Expense notes | "Lunch with client" context per entry | Low | Optional text field — very low cost, high value |
| Multi-currency support | Traveling users, international purchases | High | Complex. Deferred entirely unless user signals need. |
| Recurring expenses (subscriptions) | Netflix, Spotify — "set and forget" logging | High | Complex recurrence logic. Could auto-generate monthly entries. |
| Net worth view (assets - liabilities) | Broader financial picture | High | Requires more account types. Out of scope for v1. |
| Daily spending limit / target | "I want to spend less than $50 today" | Low | Simple daily budget counter |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Bank account sync / Plaid / OFX import | Requires internet, OAuth, third-party APIs, ongoing maintenance. Violates local-only constraint. | Manual entry is the philosophy. Own your data. |
| Receipt OCR / photo scanning | Mobile-first feature, technically complex on desktop, depends on cloud ML | Keep it fast manual entry |
| Investment tracking | Different domain (brokerage accounts, stocks). Quicken/Personal Capital own this. | Scope to spending and cash tracking only |
| Debt tracking / loan amortization | Niche financial planning — different product | Not needed |
| Bill reminders / payment scheduling | Calendar integration territory | Out of scope for v1 |
| Tax categorization / export | Accountant-facing complexity | Data export deferred to v2 per PROJECT.md |

---

## Cross-Module Features

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Unified dashboard (today view) | The whole point of Monolith — one view of everything | Medium | Habits + tasks + spending summary. The entry point. |
| Persistent sidebar navigation | Jump between modules | Low | Habits / Planner / Expenses / Dashboard |
| Dark theme | User expectation from a "power tool" app | Low | Required per PROJECT.md |
| Data persistence across sessions | SQLite — this is guaranteed by the stack choice | Low | Nothing should be lost on restart |
| App settings / preferences | At minimum: notification times, date format | Low | Basic settings screen |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Keyboard-driven navigation | Speed-first design — power users never touch the mouse | Medium | Global shortcuts (tab between modules, `N` for new item, `E` for edit, `D` for delete) |
| Tags shared across modules | "health" tag spans habits + tasks + expenses | Medium | Cross-module search / filter by tag. High conceptual value. |
| Global search | "Find anything in the app" | Medium | Search across habits, tasks, expenses, notes by keyword |
| Desktop notifications | Habit reminders, overdue task alerts | Medium | Electron's `Notification` API — relatively simple |
| Data export (CSV / JSON) | Own your data | Low | Deferred to v2 per PROJECT.md, but low complexity when ready |
| Keyboard shortcut reference modal | `?` key shows all shortcuts | Low | Standard in keyboard-driven apps (Notion, Linear, GitHub) |
| Animated / smooth transitions | Feels polished, not janky | Low | CSS transitions — sub-100ms constraint from PROJECT.md |

### Anti-Features (Cross-Module)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Cloud sync | Explicitly out of scope per PROJECT.md. Adds auth, backend, sync conflicts. | SQLite local-only is the identity of the product |
| User accounts / login | No server, no accounts. The app IS the user. | No authentication layer needed |
| Plugin / extension system | Premature abstraction. Complex to implement well. | Build the core well first. |
| Mobile companion app | Different platform, different interaction model | Desktop-only for v1 |
| Theming / color customization | Not a productivity differentiator. Adds surface area. | Commit to one dark theme and do it extremely well |
| Onboarding wizard | Power users hate wizards. Adds friction. | Good defaults + keyboard shortcut sheet |
| AI assistant / chat | Trendy but conflicts with offline-first, fast, keyboard-driven identity | The app's speed IS the value proposition |

---

## Feature Dependencies

```
Dashboard view → Habit module (data) + Planner module (data) + Expense module (data)
Tags → Habits + Tasks + Expenses (must be implemented after all three modules exist)
Global search → All modules + Daily notes (depends on having data to search)
Desktop notifications → Habits (streak reminders) + Planner (overdue tasks)
Wallet balances → Expense entry (auto-deduction) + Manual adjustments
Spending by category → Expense entry + Category system
Budget per category → Spending by category (needs baseline data first)
Spending trends → Monthly totals (aggregation of expense history)
Carry-forward tasks → Daily planner date system (requires multi-day task model)
Week view (planner) → Date navigation + Task date assignment
Habit completion charts → Streak/history data (requires history to exist first)
```

---

## MVP Recommendation

Prioritize in this order:

### Phase 1: Core per-module data entry

1. Habit list with daily checkbox + streak counter
2. Task list for today with add/complete/delete
3. Expense entry with amount + category + wallet
4. SQLite persistence across all three

**Rationale:** Data entry is the habit that must form. If logging is slow, the whole app fails.

### Phase 2: Navigation shell + dashboard

4. Sidebar navigation between modules
5. Date navigation in planner and expense views
6. Dashboard "today" view aggregating habits + tasks + spending total
7. Dark, dense UI implemented (not placeholder styling)

**Rationale:** The unified dashboard is Monolith's identity. It must exist early to validate the concept.

### Phase 3: Depth + keyboard UX

8. Habit scheduling (specific days of week)
9. Keyboard shortcuts throughout
10. Spending by category breakdown + charts
11. Habit completion heatmap
12. Daily notes per day

**Rationale:** These are the features that turn a usable app into a daily driver.

### Defer

| Feature | Reason |
|---------|--------|
| Tags across modules | Complex to get right, lower priority than core CRUD |
| Budget per category | Needs baseline expense data first |
| Global search | Needs data density before search is valuable |
| Carry-forward tasks | Correctness is tricky; defer to avoid bugs |
| Recurring expenses | Complex recurrence model |
| Data export | Low-effort v2 addition |
| Recurring tasks | Out of scope per PROJECT.md |
| Desktop notifications | Nice to have; add after core flow is stable |

---

## Sources

All findings from training data (knowledge cutoff August 2025). Apps surveyed mentally:

- Habit trackers: Streaks (iOS), Habitica, HabitNow, Everyday, Habitory, Loop Habit Tracker
- Task/planner apps: Things 3, OmniFocus, Todoist, Linear, Notion, Obsidian Daily Notes
- Expense trackers: YNAB, Actual Budget, Copilot, Money Manager, Spendee, 1Money
- Desktop productivity references: Raycast, Warp terminal, Linear app (for dense UI patterns)

Web search and WebFetch were unavailable during this research session. Claims marked MEDIUM confidence. Recommend verifying competitor feature sets via their public feature pages or app store listings before finalizing roadmap.
