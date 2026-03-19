# Project Research Summary

**Project:** Monolith — Electron + React Desktop Productivity App
**Domain:** Electron desktop app combining habit tracking, daily planning, and expense management
**Researched:** 2026-03-19
**Confidence:** MEDIUM

## Executive Summary

Monolith is a local-first desktop productivity app built on Electron + React, combining three independent modules (habit tracker, daily planner, expense tracker) behind a unified dashboard. The expert approach for this class of app is a strict two-process architecture: a Node.js main process owns all SQLite access via better-sqlite3, a Chromium renderer process owns the React UI, and a typed contextBridge preload script acts as the only legal communication channel between them. This is not optional — it is the security model Electron enforces, and deviating from it causes both security vulnerabilities and structural problems that cannot be easily fixed later. The recommended stack (electron-vite + React 19 + TypeScript + Drizzle ORM + Zustand + TanStack Query) is purpose-built for this architecture and has been selected to minimize packaging complexity, eliminate unnecessary runtime overhead, and preserve the sub-100ms performance requirement.

The unified dashboard is Monolith's defining identity — the reason users choose it over three separate apps. This means the dashboard must exist and be usable early, not as a final integration step. Feature research confirms that each module has clear table-stakes requirements: streak counters and per-day scheduling for habits, date navigation and task carry-forward for the planner, wallet balance tracking and category breakdowns for expenses. The keyboard-first, non-generic aesthetic requirement shapes every technology choice: no pre-built component libraries (shadcn/ui, MUI, Ant Design), Tailwind CSS as a utility system with custom design tokens, and a global keyboard router built before any module UI.

The primary risks are structural and must be addressed in Phase 1 before any feature development: correct Electron security configuration (contextBridge, nodeIntegration: false), a migration-based schema from day one, typed IPC channel definitions, a design token system, and a global keyboard router. These are cheap to do correctly from the start and expensive to retrofit. Secondary risks include timezone-naive streak logic (breaks user trust), monolithic React re-renders on the dashboard (breaks the performance requirement), and treating code signing and auto-update as afterthoughts (breaks distribution). All critical pitfalls have clear prevention strategies documented in PITFALLS.md.

---

## Key Findings

### Recommended Stack

The stack is purpose-built for Electron's three-process model. `electron-vite` handles the build complexity of main/preload/renderer with correct HMR across all three. `better-sqlite3` is the unambiguous SQLite choice — synchronous, fast, native, and well-understood in Electron contexts. `Drizzle ORM` wins over Prisma because Prisma requires a packaged native binary that has historically broken Electron builds; Drizzle compiles away entirely. `Zustand` (one store per module) and `TanStack Query` (IPC-as-server-state pattern) together eliminate hand-rolled cache invalidation logic. Custom Tailwind with CSS design tokens is mandatory — pre-built component libraries produce the generic aesthetic Monolith explicitly rejects.

**Core technologies:**
- **Electron ^34.x**: Desktop shell, OS integration, window management — only option for true native desktop
- **React 19 + TypeScript 5.7**: UI layer — concurrent features, compiler optimizations; TypeScript catches process-boundary mistakes at compile time
- **electron-vite ^3.x**: Build pipeline — purpose-built for Electron's three-process structure; best DX for this setup
- **better-sqlite3 ^9.x**: SQLite driver — synchronous, native, fastest option; only runs in main process
- **Drizzle ORM ^0.40.x**: Schema + migrations — zero runtime overhead, compiles away, no packaging issues unlike Prisma
- **Zustand ^5.x**: UI state — one store per module, minimal boilerplate, no Provider wrapping
- **TanStack Query ^5.x**: IPC-as-server-state bridge — caches query results, handles mutations + invalidation
- **Tailwind CSS ^4.x + CSS custom properties**: Styling — utility control without component library opinions
- **Recharts ^2.x**: Charts — declarative, composable, SVG-based, themeable
- **node-cron ^3.x**: Notification scheduling — lightweight, runs in main process, no daemon needed
- **Vitest ^3.x**: Unit testing — Vite-native, fast, correct choice for this stack

**Version flags (verify before locking):** Electron 34.x, electron-vite ^3.x, Drizzle ^0.40.x, Tailwind v4 stability — all MEDIUM confidence; check npm registry before starting.

### Expected Features

Each module has a clear table-stakes floor that users expect. Below that floor, users reach for dedicated apps instead. The differentiators are what make Monolith worth using daily over a collection of simpler tools. See FEATURES.md for full tables.

**Must have — Habit Tracker:**
- Daily checklist with streak counter (best + current) — the core motivator; missing this feels broken
- Per-day scheduling (Mon/Wed/Fri habits) — required for realistic habit sets
- Completion history / 30-day grid — users need proof habits are sticking
- Add / edit / archive (not delete) — archive preserves history
- Today view as primary entry point

**Must have — Daily Planner:**
- Task list for today with add / complete / delete
- Date navigation (view past/future days)
- Task ordering (manual priority)
- Daily notes textarea per day — PROJECT.md explicitly calls this out

**Must have — Expense Tracker:**
- Log expense (amount + date + category) — must be fast, 3 fields + Enter
- Wallet / account tracking with auto-deduction
- Monthly total + spending by category breakdown
- Edit / delete correction flow

**Must have — Cross-Module:**
- Unified dashboard (today: habits + tasks + spending summary) — Monolith's identity
- Dark theme, persistent sidebar navigation, keyboard shortcuts
- SQLite persistence (guaranteed by stack)

**Should have (competitive differentiators):**
- Habit completion calendar heatmap (GitHub-style visualization)
- Task carry-forward (unfinished tasks surface automatically)
- Budget per category with actual-vs-budget comparison
- Keyboard-driven global navigation (never touch the mouse)
- Spending trends over time (line chart)
- Streak freeze / grace period

**Defer to v2+:**
- Tags shared across modules (complex cross-cutting concern)
- Global search (needs data density before it's valuable)
- Recurring tasks and expenses (complex recurrence model)
- Data export (CSV/JSON)
- Budget per category (needs baseline expense history first)
- Desktop notifications (add after core flow is stable)
- Multi-currency support

### Architecture Approach

Monolith uses a strict Electron two-process split: main process owns SQLite, notifications, and OS integration; renderer process owns all React UI; a typed contextBridge preload script is the only communication surface. The three modules share a single window shell but are isolated at the feature-folder level. Repositories in the main process (one per module) own all SQL. Zustand stores in the renderer (one per module) own UI state and optimistic updates. TanStack Query wraps IPC calls as query functions, eliminating hand-rolled stale-data logic. Build order follows hard dependencies: DB and migrations first, then IPC types, then repositories, then IPC handlers, then preload, then shell, then module views, then dashboard.

**Major components:**
1. **Shell (Renderer)** — window chrome, sidebar, keyboard router, theme; renders all module views
2. **IPC Bridge (Preload)** — contextBridge exposeInMainWorld; typed API surface; the contract between processes
3. **IPC Handlers (Main)** — ipcMain.handle per channel, delegates to repositories
4. **Repositories (Main, per module)** — HabitRepository, PlannerRepository, ExpenseRepository, WalletRepository; own all SQL
5. **Zustand Stores (Renderer, per module)** — useHabitStore, usePlannerStore, useExpenseStore; optimistic updates
6. **Dashboard (Renderer)** — reads from all three module stores; dedicated IPC handler for today aggregation
7. **SQLite + Migrations** — single DB file at userData path; migration runner on startup; never schema change without migration
8. **Notification Scheduler (Main)** — node-cron, fires OS notifications for unchecked habits

**Key pattern — Optimistic Updates:**
User clicks habit checkbox → UI marks done immediately in store → IPC call to main → SQLite write → streak count returned → store confirmed. The sub-100ms feel requirement demands this pattern throughout.

### Critical Pitfalls

Derived from PITFALLS.md. These are not warnings — they are build-order requirements.

1. **No contextBridge (nodeIntegration: true)** — Set `contextIsolation: true`, `nodeIntegration: false` in every BrowserWindow, from the first line of code. Never expose raw ipcRenderer to the renderer; always wrap in named functions. Phase 1 blocker.

2. **No migration strategy** — `CREATE TABLE IF NOT EXISTS` scattered in init code is not a migration strategy. Use `PRAGMA user_version` and a numbered migration runner from day one. Retrofitting migrations after schema changes cause user data loss. Phase 1 blocker.

3. **No design token system** — Building a dense UI component by component with ad-hoc font sizes and colors produces a spreadsheet aesthetic, not a dev-tool aesthetic. Define type scale (5-6 sizes), color palette (12 values max), and 4px spacing grid before writing any feature UI. Phase 1 blocker.

4. **No global keyboard router** — Adding keyboard shortcuts module-by-module produces conflicting key capture, broken focus management, and an app that lies about being keyboard-driven. Build a global keyboard router in the shell before any module. Phase 1 blocker.

5. **Timezone-naive streak logic** — `new Date()` for streak comparison breaks in non-UTC timezones, past midnight, and across timezone changes. Use a single canonical "today's date for habit purposes" function, store UTC in SQLite, use `date-fns` for arithmetic, and unit test with timezone edge cases. Phase 2 risk, design in Phase 1.

6. **Dashboard monolithic re-renders** — A single state change (checking a habit) that re-renders the entire dashboard including charts and expense summaries destroys the performance requirement. One Zustand store per module, `React.memo` on all list items, `useCallback` for event handlers, `useMemo` for chart data. Establish this pattern early.

7. **IPC channel name chaos** — Ad-hoc string channel names across multiple modules become unmaintainable. Define all channel names in a single typed const (`shared/ipc-channels.ts`) using `module:resource:action` convention from day one.

---

## Implications for Roadmap

Architecture research provides a clear dependency ordering. Feature research confirms which features cluster naturally. Pitfalls research identifies which concerns must be addressed before module development begins. Together they suggest 5 phases.

### Phase 1: Foundation — Electron Shell + Data Layer + UI System

**Rationale:** Every other phase depends on this. The IPC architecture, schema migrations, design tokens, and keyboard router must be correct before writing a single feature. These are the cheapest things to do correctly early and the most expensive to fix late. The build order from ARCHITECTURE.md is explicit: DB + migrations first, IPC types second, repositories third, IPC handlers fourth, preload fifth.

**Delivers:**
- Electron window with correct security config (contextIsolation, no nodeIntegration)
- SQLite connected at userData path with migration runner active
- Typed IPC channel definitions and contextBridge setup
- Shell layout: sidebar with module slots, keyboard router
- Design token system: CSS custom properties for typography, colors, spacing
- All three module repositories (empty CRUD, schema defined)
- Dark theme baseline — not placeholder gray, the actual design

**Features from FEATURES.md:** App settings, persistent sidebar navigation, dark theme, SQLite persistence guarantee

**Pitfalls avoided:** Pitfall 1 (nodeIntegration), Pitfall 2 (no migrations), Pitfall 4 (design tokens), Pitfall 5 (keyboard router), Pitfall 9 (IPC channel chaos), Pitfall 14 (categories in DB not code), Pitfall 15 (no transparency effects)

**Research flag:** Standard patterns — well-documented Electron setup; skip research-phase for this phase.

---

### Phase 2: Module Core — Per-Module Data Entry (Table Stakes)

**Rationale:** Data entry is the habit that must form. If logging a habit, task, or expense is slow or awkward, the app fails its core promise regardless of how good the dashboard is. Each module needs its minimum viable interaction loop: add an item, check it off, see it persist. All three in parallel because they share no runtime state — they only converge at the dashboard.

**Delivers:**
- Habit module: daily checklist, streak counter, add/edit/archive, today view
- Planner module: task list for today, add/complete/delete, date navigation, daily notes
- Expense module: log expense (amount + category + wallet), wallet balance auto-deduction, expense list
- Optimistic update pattern established on all write operations
- TanStack Query wired to IPC calls for all modules

**Features from FEATURES.md:** All table-stakes items across all three modules

**Pitfalls avoided:** Pitfall 3 (re-render isolation — establish Zustand-per-module pattern here), Pitfall 10 (streak timezone logic — unit test before UI), Pitfall 12 (state-based routing, not react-router-dom), Pitfall 13 (error boundaries per module)

**Stack used:** better-sqlite3 + Drizzle repositories, Zustand per-module stores, TanStack Query, Tailwind + design tokens

**Research flag:** Streak date logic needs careful TDD. Consider a quick research spike on date-fns timezone handling if unfamiliar.

---

### Phase 3: Navigation Shell + Unified Dashboard

**Rationale:** With all three modules having working data layers, the dashboard can aggregate real data. This phase validates Monolith's core identity — "three apps in one view." The dashboard is not a Phase 1 placeholder; it is built here with real data and real keyboard navigation. This is when the product becomes testable as a daily driver concept.

**Delivers:**
- Unified dashboard: today's habits (count + which ones), today's tasks (count + overdue), today's spending total
- Full keyboard navigation: tab between modules, shortcuts for create/edit/delete in each module, `?` shortcut reference modal
- Sidebar navigation completed and keyboard-accessible
- Window state persistence (last active module, window size/position) via electron-store

**Features from FEATURES.md:** Unified dashboard, keyboard-driven navigation, shortcut reference modal, data persistence across restarts

**Pitfalls avoided:** Pitfall 3 (dashboard aggregation via dedicated IPC handler, not client-side join), Pitfall 7 (window state persisted via electron-store)

**Architecture:** Dedicated `dashboard:getToday` IPC handler that aggregates in SQL — never compute dashboard in the renderer from full module datasets.

**Research flag:** Standard patterns. Dashboard aggregation query design is straightforward SQL.

---

### Phase 4: Depth + Differentiators

**Rationale:** The app is a daily driver by Phase 3's end. Phase 4 adds the features that turn "usable" into "preferred." These are the differentiators from FEATURES.md — features competitors have but that can be done better in a dense, keyboard-driven desktop context. Charts here are meaningful because real data exists.

**Delivers:**
- Habit scheduling (specific days of week — Mon/Wed/Fri patterns)
- Habit completion calendar heatmap (GitHub-style, Recharts SVG)
- Spending by category breakdown (bar chart)
- Spending trends over time (line chart, monthly)
- Task carry-forward (unfinished tasks surface at top of today's list)
- Budget per category (actual vs budget indicator)
- Streak freeze / grace period
- Habit categories / groups

**Features from FEATURES.md:** All "should have" differentiators across all three modules

**Stack used:** Recharts for all charts, date-fns for carry-forward date logic

**Research flag:** Carry-forward task logic has correctness edge cases (what if a task is carry-forwarded 7 days?). A brief design spike before implementation is recommended.

---

### Phase 5: Polish + Distribution

**Rationale:** The final phase addresses everything that makes the app shippable: performance profiling, error resilience, auto-update infrastructure, and packaging. Code signing setup belongs here but must be started early in the phase — certificates take time. This phase produces a distributable binary.

**Delivers:**
- Auto-updater wired to GitHub Releases via electron-builder
- Code signing (platform-appropriate: Apple Developer + Windows EV cert)
- Notification scheduler for habit reminders (node-cron + Electron Notification API)
- Performance profiling pass: React DevTools Profiler on dashboard, IPC timing
- Local error logging (IPC handler that writes to log file)
- Production build validation: no DevTools open, no debug flags

**Features from FEATURES.md:** Desktop notifications, final polish pass

**Pitfalls avoided:** Pitfall 6 (auto-updater + code signing not left to last day), Pitfall 11 (DevTools guard for production)

**Research flag:** Code signing setup on both platforms has known sharp edges. This phase needs a focused research spike on electron-builder code signing configuration, particularly Windows EV certificate requirements and macOS notarization flow. Do this before starting, not after.

---

### Phase Ordering Rationale

- **Foundation before modules:** Repositories, IPC types, and design tokens are shared infrastructure. Building them first means modules never need to refactor their contracts.
- **Modules before dashboard:** The dashboard aggregates from all three modules. Building it before the modules have working data layers produces placeholder UI that misleads validation.
- **Dashboard before differentiators:** The unified dashboard is the product's identity. Validating it with real data before adding depth features is the right order.
- **Distribution last but code signing early within that phase:** The packaging and signing setup has external dependencies (certificate procurement, Apple enrollment) that cannot be rushed.

### Research Flags

Phases needing deeper research during planning:
- **Phase 2 (streak date logic):** Unit test plan needed before implementation. `date-fns` timezone API is not obvious. Design the canonical "today" function and its tests before writing streak logic.
- **Phase 4 (carry-forward task logic):** Edge cases (multi-day carry, manual dismissal, tasks that should not carry forward) need explicit design before implementation.
- **Phase 5 (code signing + auto-update):** electron-builder code signing configuration differs significantly between platforms and has changed across Electron versions. A dedicated research spike is warranted before starting distribution work.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Electron shell + IPC):** Well-documented, stable since Electron v12. Patterns are established.
- **Phase 3 (dashboard):** SQL aggregation + Zustand selectors. Standard patterns.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Core choices (better-sqlite3, Zustand, TanStack Query, Recharts) are HIGH confidence. Version numbers for Electron, electron-vite, Drizzle, and Tailwind v4 are MEDIUM — verify on npm before starting. No live verification was possible in this research session. |
| Features | MEDIUM | Drawn from training data analysis of Streaks, Habitica, YNAB, Actual Budget, Things 3, Todoist, Linear. No live competitor verification. Table stakes are well-established; differentiator prioritization reflects informed judgment, not user research. |
| Architecture | HIGH | Electron two-process model is stable and well-documented since v12. Repository pattern, contextBridge usage, and Zustand-per-module are established community consensus. High confidence these patterns are correct. |
| Pitfalls | MEDIUM | All pitfalls are well-reported in the Electron + React ecosystem. The IPC security and migration pitfalls are HIGH confidence (official Electron docs confirm). Streak timezone and dashboard re-render pitfalls are MEDIUM — real risk, community-confirmed, but severity depends on implementation choices. |

**Overall confidence: MEDIUM**

All research was conducted from training data (cutoff August 2025). Web search and WebFetch were unavailable. The architecture and pitfall guidance is well-grounded. The version numbers need verification against current npm. Feature prioritization should be validated against user expectations once real users are available.

### Gaps to Address

- **Version verification:** Electron 34.x, electron-vite ^3.x, Drizzle ^0.40.x, Tailwind v4 — check npm registry before `package.json` is written. Running an outdated or pre-release version against this guidance would invalidate some assumptions.
- **Tailwind v4 stability:** v4 was in release candidate status as of mid-2025. Confirm stable release and Vite plugin availability before committing to it. Tailwind v3 is the safe fallback.
- **Competitor feature verification:** Feature table stakes were derived from training data. Confirm against current app store listings for Habitica, YNAB, and Things 3 before final feature prioritization.
- **Code signing certificate procurement timeline:** Purchasing a Windows EV certificate and enrolling in Apple Developer Program both have processing times. Factor into Phase 5 planning.
- **Habit "day" definition:** What time does a new habit day start? 3am? Midnight? This is a product decision with implementation consequences (streak logic). Decide before Phase 2.

---

## Sources

### Primary (HIGH confidence)
- Electron official documentation — process model, context isolation, IPC security (training data, stable API since Electron 12)
- better-sqlite3 design rationale — synchronous API, threading model (training data, stable through August 2025)
- Zustand documentation — store-per-feature pattern (training data, well-established React pattern)
- SQLite single-user performance characteristics — widely documented behavior

### Secondary (MEDIUM confidence)
- electron-vite project — three-process build configuration (training data, multiple OSS project references)
- Drizzle ORM vs Prisma comparison — Electron packaging issues with Prisma binary (community post-mortems in training data)
- React DevTools team — re-render optimization recommendations
- Electron security checklist — nodeIntegration deprecation, contextBridge requirements
- Apps surveyed for feature research: Streaks, Habitica, HabitNow, Things 3, OmniFocus, Todoist, YNAB, Actual Budget, Copilot, Money Manager, Linear, Raycast

### Tertiary (LOW confidence — needs verification)
- Electron 34.x as current latest — verify at npmjs.com/package/electron
- electron-vite ^3.x version — verify at electron-vite.org
- Drizzle ORM ^0.40.x — verify at npmjs.com/package/drizzle-orm
- Tailwind CSS v4 as stable — verify at tailwindcss.com

---

*Research completed: 2026-03-19*
*Ready for roadmap: yes*
