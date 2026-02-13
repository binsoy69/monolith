# Monolith

A comprehensive, offline-first personal productivity application built with Next.js. Monolith integrates habit tracking, finance management, journaling, task management, and a markdown vault into a single, cohesive interface.

## Features

- **Habit Tracking**: Track daily, weekly, and custom frequency habits with streak calculation and history visualization.
- **Finance**: Manage budgets, track transactions, and visualize spending trends.
- **Journal**: Daily journaling with mood tracking, tagging, and markdown support. Entries can be encrypted.
- **Tasks**: Hierarchical task management with priorities, due dates, and tagging.
- **Vault**: A file-system based markdown knowledge base.
- **Offline-First**: Uses local SQLite database and file system. Data stays on your machine.
- **Customizable**: Dark/Light mode, command palette for quick navigation.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, TailwindCSS v4, Shadcn/ui
- **Database**: SQLite (via `better-sqlite3`)
- **ORM**: Drizzle ORM
- **Testing**: Vitest (Unit/Integration), Playwright (E2E)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate database migrations:
   ```bash
   npx drizzle-kit generate
   ```
   _Note: This creates the SQLite database schema in `src/lib/db/migrations`._

### Running the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Testing

### Unit & Integration Tests

Run the Vitest suite:

```bash
npm test
```

### End-to-End Tests

Run Playwright tests:

```bash
npx playwright test
```

## Project Structure

- `src/app`: Next.js App Router pages and layouts
- `src/components`: React components organized by feature (dashboard, habits, finance, etc.)
- `src/lib/db`: Database schema, migrations, and client
- `src/lib/services`: Business logic and data access layer
- `src/lib/utils`: Helper functions
- `tests`: Test suites (unit, integration, e2e)

## License

MIT
