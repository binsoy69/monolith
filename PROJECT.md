# Monolith

> An offline-first, all-in-one personal productivity app — habits, journal, finance, vault, tasks, and dashboard. All data stored locally in SQLite.

---

## Quick Reference

| Field                | Value                                               |
| -------------------- | --------------------------------------------------- |
| **Type**             | Local web app (desktop packaging planned)           |
| **Status**           | Planning complete · Awaiting implementation         |
| **Framework**        | Next.js 16 (App Router) + TypeScript (strict)       |
| **Database**         | SQLite via Drizzle ORM (`better-sqlite3`)           |
| **Styling**          | TailwindCSS + shadcn/ui (Radix primitives)          |
| **Theme**            | Light + Dark (system default, `next-themes`)        |
| **Testing**          | Vitest + React Testing Library + Playwright         |
| **Future packaging** | Tauri v2                                            |
| **Data location**    | OS-appropriate `%APPDATA%/Monolith/` (configurable) |

---

## Modules

| Module        | Description                                                             |
| ------------- | ----------------------------------------------------------------------- |
| **Habits**    | Daily/weekly/monthly tracking, streaks, categories, completion charts   |
| **Journal**   | Markdown editor, tags, mood, FTS5 search, optional per-entry encryption |
| **Finance**   | Income/expense/transfer, budgets, savings goals, charts                 |
| **Vault**     | Obsidian-style local markdown vault — folder tree, edit + preview       |
| **Tasks**     | To-do list with subtasks, `.md` file import → auto-convert              |
| **Dashboard** | Today-at-a-glance: habits due, recent journal, budget status, tasks     |
| **Calendar**  | Unified view across journal, tasks, and habit completions               |

---

## Design Principles

1. **Local-first** — Zero cloud. All data on-disk (SQLite + file vault).
2. **Modular monolith** — Feature modules isolated but sharing one DB and design system.
3. **Simplicity first** — No over-engineering. Add patterns only when proven necessary.
4. **Portfolio-quality** — TypeScript, tests, docs — but pragmatic, not academic.
5. **Tauri-ready** — Architecture stays compatible with Tauri v2 packaging.

---

## Design Aesthetic

**"Productive Minimalism"** — inspired by Notion × Obsidian × YNAB.

- Text-first, low visual noise, generous whitespace
- Typography: `Plus Jakarta Sans` (headings/body) + `JetBrains Mono` (code)
- Subtle glass/soft shadows only where they improve readability
- No decorative animations — purposeful motion only

---

## Key Architecture Decisions

| Decision    | Choice                             | Why                                          |
| ----------- | ---------------------------------- | -------------------------------------------- |
| Framework   | Next.js 16 local dev → Tauri later | Fastest DX, no Electron overhead             |
| ORM         | Drizzle over Prisma                | Lighter, better SQLite fit, no binary engine |
| API pattern | Service Layer (not Repository)     | Data source won't change — YAGNI             |
| Search      | SQLite FTS5                        | Built-in, zero dependency, fast              |
| Encryption  | AES-256-GCM (Node `crypto`)        | No external libs, PBKDF2 key derivation      |

---

## Related Docs

| File                                 | Purpose                                   |
| ------------------------------------ | ----------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Tech stack, schema, API design, data flow |
| [ROADMAP.md](./ROADMAP.md)           | Phased execution plan with task breakdown |

---

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npx vitest run           # Unit + integration
npx playwright test      # E2E

# DB migrations
npx drizzle-kit push     # Apply schema changes
npx drizzle-kit generate # Generate migration files
```
