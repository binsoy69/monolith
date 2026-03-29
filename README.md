# Monolith

Monolith is a local-first desktop productivity workspace built with Electron, React, and TypeScript. It combines habit tracking, daily planning, notes, and expense management in a single application with SQLite-backed local storage.

## Overview

Monolith is organized as a full desktop application rather than a starter template. The codebase includes a dedicated Electron main process, a secure preload bridge, modular React views, IPC-backed data flows, and automated test coverage for core UI and data behavior.

## Feature Set

- Unified dashboard for daily habits, planner activity, and spending snapshots
- Habit tracking with scheduled days, count-based targets, streak-aware progress, archive support, and reminders
- Planner workflows for dated tasks, daily notes, and quick item creation
- Expense tracking with wallets, categories, balance adjustments, transaction history, and analytics views
- Command palette and keyboard shortcuts for fast navigation
- Global search across habits, tasks, daily notes, and expenses
- GitHub release-based update support for packaged builds

## Tech Stack

- Electron + electron-vite
- React 19 + TypeScript
- SQLite via `better-sqlite3`
- Zustand and TanStack Query for state and data orchestration
- Tailwind CSS 4 for styling
- Vitest and Testing Library for test coverage

## Getting Started

### Prerequisites

- Node.js LTS
- npm

### Install Dependencies

```bash
npm install
```

### Start Development

```bash
npm run dev
```

### Run Quality Checks

```bash
npm run lint
npm run typecheck
npm test
```

## Build Targets

```bash
npm run build:unpack
npm run build:win
npm run build:mac
npm run build:linux
```

The documented release flow today is Windows-focused. See [docs/windows-release.md](docs/windows-release.md) for the current release checklist.

## Project Structure

```text
src/
  main/       Electron main process, database, services, and IPC handlers
  preload/    Secure renderer bridge
  renderer/   React application shell and feature modules
  shared/     Shared domain types and utilities
tests/        Automated UI and data-layer tests
docs/         Release and supporting project documentation
```

## Data and Packaging Notes

- Application data is stored locally in the Electron user data directory as `monolith.db`
- The app uses a single-instance lock to avoid concurrent SQLite writes
- Packaging is configured through `electron-builder.yml`
- GitHub Releases are configured as the publish target for packaged builds

## Common Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Electron + Vite development environment |
| `npm run lint` | Run ESLint across the project |
| `npm run typecheck` | Run TypeScript checks for main and renderer code |
| `npm test` | Rebuild native dependencies if needed and run Vitest |
| `npm run build:unpack` | Produce an unpacked desktop build |
| `npm run build:win` | Build the Windows installer |
| `npm run build:mac` | Build the macOS package |
| `npm run build:linux` | Build the Linux package |
