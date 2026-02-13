# Monolith — Roadmap

> Phased execution plan. Each phase builds on the previous one. Phases are ordered by dependency — nothing in Phase 2 depends on Phase 3.

---

## Phase 1: Foundation

> **Goal:** Bootable app shell with working DB, layout, and settings.

| #    | Task                             | Details                                                              | Status |
| ---- | -------------------------------- | -------------------------------------------------------------------- | ------ |
| 1.1  | Scaffold Next.js 16 + TypeScript | `npx create-next-app@latest ./` with App Router, strict TS           | ✅     |
| 1.2  | Configure TailwindCSS            | Design tokens, CSS variables, dark/light theme                       | ✅     |
| 1.3  | Install shadcn/ui                | Initialize + add base components (Button, Card, Dialog, Input, etc.) | ✅     |
| 1.4  | Set up SQLite + Drizzle ORM      | `better-sqlite3`, `drizzle-orm`, `drizzle-kit`, connection singleton | ✅     |
| 1.5  | Define full DB schema            | All tables from ARCHITECTURE.md in `schema.ts`                       | ✅     |
| 1.6  | Run initial migration            | `drizzle-kit push` to create all tables                              | ✅     |
| 1.7  | Build layout shell               | Sidebar (collapsible), TopBar, content area, route groups            | ✅     |
| 1.8  | Settings page                    | Data directory config, portable mode toggle, theme toggle            | ✅     |
| 1.9  | Data path resolver               | OS-aware `getDataDir()` with portable mode fallback                  | ✅     |
| 1.10 | Theme provider                   | `next-themes` setup, system preference default                       | ✅     |

**Deliverable:** App runs at `localhost:3000` with sidebar nav, theme toggle, and empty module pages reading from SQLite.

---

## Phase 2: Core Modules

> **Goal:** All four primary modules functional with full CRUD.

### 2A — Habit Tracker

| #    | Task                                                     | Status |
| ---- | -------------------------------------------------------- | ------ |
| 2A.1 | Habits CRUD API (`/api/habits`)                          | ✅     |
| 2A.2 | Categories CRUD API                                      | ✅     |
| 2A.3 | Habit logging API (check-off, undo)                      | ✅     |
| 2A.4 | Streak + completion rate calculation (service)           | ✅     |
| 2A.5 | Habit list page with daily check-off UI                  | ✅     |
| 2A.6 | Habit detail page (edit, stats, history)                 | ✅     |
| 2A.7 | Streak history graph (Recharts)                          | ✅     |
| 2A.8 | Custom frequency UI (daily / every N / weekly / monthly) | ✅     |
| 2A.9 | Unit tests for streak + frequency logic                  | ✅     |

### 2B — Journal

| #    | Task                                                  | Status |
| ---- | ----------------------------------------------------- | ------ |
| 2B.1 | Journal CRUD API                                      | ✅     |
| 2B.2 | Markdown editor component (MDXEditor or Milkdown)     | ✅     |
| 2B.3 | Journal list page (filterable by date, mood, tag)     | ✅     |
| 2B.4 | Entry editor page (edit + preview, mood picker, tags) | ✅     |
| 2B.5 | YAML front matter parsing + display                   | ✅     |
| 2B.6 | Image handling (relative paths, paste-to-upload)      | ✅     |
| 2B.7 | FTS5 full-text search API + search UI                 | ✅     |
| 2B.8 | Unit tests for search + front matter parsing          | ✅     |

### 2C — Finance Tracker

| #     | Task                                                    | Status |
| ----- | ------------------------------------------------------- | ------ |
| 2C.1  | Transactions CRUD API                                   | ✅     |
| 2C.2  | Categories + Accounts CRUD API                          | ✅     |
| 2C.3  | Budgets + Savings Goals API                             | ✅     |
| 2C.4  | Transaction list page (filter by date, category, type)  | ✅     |
| 2C.5  | Finance overview page (monthly summary)                 | ✅     |
| 2C.6  | Category pie chart (Recharts)                           | ✅     |
| 2C.7  | Trend line chart (income vs expense over time)          | ✅     |
| 2C.8  | Recurring transactions logic                            | ✅     |
| 2C.9  | Budget status indicators                                | ✅     |
| 2C.10 | Unit tests for transaction totals + budget calculations | ✅     |

### 2D — Markdown Vault

| #    | Task                                               | Status |
| ---- | -------------------------------------------------- | ------ |
| 2D.1 | Vault file system API (tree, read, write, delete)  | ✅     |
| 2D.2 | Folder tree sidebar component                      | ✅     |
| 2D.3 | File editor + preview page (reuse Markdown editor) | ✅     |
| 2D.4 | Quick-open search                                  | ✅     |
| 2D.5 | Create file / create folder UI                     | ✅     |
| 2D.6 | Relative image rendering                           | ✅     |
| 2D.7 | Optional journal ↔ vault interop (shared folder)   | ✅     |

**Deliverable:** All core modules working end-to-end — create, view, edit, delete data in each.

---

## Phase 3: Integration & Extras

> **Goal:** Cross-module features, import/export, encryption, and the unified dashboard.

| #    | Task                         | Details                                                                  | Status |
| ---- | ---------------------------- | ------------------------------------------------------------------------ | ------ |
| 3.1  | Dashboard page               | Today panel: habits due, recent journal, budget snapshot, upcoming tasks | ✅     |
| 3.2  | Task manager                 | CRUD, subtasks, priority, drag-sort                                      | ✅     |
| 3.3  | `.md` → task import          | Parse markdown checklists into tasks automatically                       | ✅     |
| 3.4  | Calendar view                | Unified calendar: journal entries + task deadlines + habit completions   | ✅     |
| 3.5  | Command palette              | `Ctrl+K` global search across all modules                                | ✅     |
| 3.6  | Full backup/restore          | Export entire DB as ZIP (optionally encrypted), import to restore        | ✅     |
| 3.7  | CSV export                   | Habits table, transactions table                                         | ✅     |
| 3.8  | Markdown export              | Journal entries as `.md` files                                           | ✅     |
| 3.9  | Per-entry journal encryption | AES-256-GCM, PBKDF2 key derivation, encrypt/decrypt UI                   | ✅     |
| 3.10 | Vault password gate          | Optional master password for vault access                                | ✅     |
| 3.11 | Local notifications          | Habit reminders via Notification API (browser)                           | ✅     |

**Deliverable:** Fully integrated app — cross-module dashboard, import/export, encryption for sensitive data.

---

## Phase 4: Polish & Quality

> **Goal:** Production-quality testing, performance, documentation, and Tauri prep.

| #   | Task                           | Details                                                                 | Status |
| --- | ------------------------------ | ----------------------------------------------------------------------- | ------ |
| 4.1 | Unit test suite                | Vitest: services + utils (streak calc, budget math, crypto, MD parsing) | ⬜     |
| 4.2 | Integration test suite         | API + DB roundtrips with temp SQLite files                              | ⬜     |
| 4.3 | E2E test suite                 | Playwright: create habit, log transaction, journal entry, vault file    | ⬜     |
| 4.4 | Performance: lazy loading      | Dynamic imports for heavy components (editor, charts)                   | ⬜     |
| 4.5 | Performance: virtualized lists | For large habit/transaction/journal lists                               | ⬜     |
| 4.6 | Accessibility audit            | Keyboard nav, focus management, ARIA, contrast                          | ⬜     |
| 4.7 | README + setup guide           | Installation, dev workflow, architecture overview                       | ⬜     |
| 4.8 | Tauri compatibility check      | Verify Drizzle + better-sqlite3 works in Tauri, document path           | ⬜     |

**Deliverable:** Ship-ready local app with solid test coverage and documentation.

---

## Phase 5: Native Desktop (Future)

> **Goal:** Package with Tauri v2 for a native desktop experience.

| #   | Task                                                       | Status |
| --- | ---------------------------------------------------------- | ------ |
| 5.1 | Initialize Tauri v2 in project                             | ⬜     |
| 5.2 | Configure native window (custom title bar, tray)           | ⬜     |
| 5.3 | Replace browser Notification API with native notifications | ⬜     |
| 5.4 | Auto-updater configuration                                 | ⬜     |
| 5.5 | Build targets (Windows NSIS, macOS DMG, Linux AppImage)    | ⬜     |
| 5.6 | Test packaging + data path resolution in native context    | ⬜     |

---

## Progress Tracker

| Phase                   | Total Tasks | Done | Progress             |
| ----------------------- | ----------- | ---- | -------------------- |
| Phase 1: Foundation     | 10          | 10   | ✅✅✅✅✅✅✅✅✅✅ |
| Phase 2: Core Modules   | 33          | 33   | ✅✅✅✅✅✅✅✅✅✅ |
| Phase 3: Integration    | 11          | 0    | ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ |
| Phase 4: Polish         | 8           | 0    | ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ |
| Phase 5: Tauri (future) | 6           | 0    | ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ |
