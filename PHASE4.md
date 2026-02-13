# Phase 4: Polish & Quality - Implementation Plan

This document outlines the detailed implementation plan for Phase 4 of the Monolith project, focused on testing, performance, accessibility, and preparation for Tauri.

## 1. Unit Test Suite (Vitest)

**Goal:** comprehensive coverage for business logic and utility functions.
**Skill Reference:** `unit-testing-test-generate`

### Strategy

- **Framework:** `Vitest` (fast, Vite-native) + `@testing-library/react`.
- **Scope:**
  - **Services:** Streak calculation (`lib/services/habits.ts`), budget math (`lib/services/finance.ts`).
  - **Utils:** Date helpers, string formatting, crypto utilities (`lib/crypto.ts`).
  - **Parsers:** Markdown/Frontmatter parsing (`lib/markdown.ts`).
- **Implementation Steps:**
  1.  Install dependencies: `vitest`, `@testing-library/react`, `@testing-library/dom`, `jsdom`.
  2.  Configure `vitest.config.ts` to share Vite config.
  3.  Create `__tests__` directories co-located with source files or in a top-level `tests/unit` folder.
  4.  **Action Item:** Use `unit-testing-test-generate` skill patterns to generate initial test cases for pure functions.
      - _Example:_ Generate varied inputs for streak calculation (gaps, overlaps, future dates).
  5.  Run coverage reports to identify gaps.

## 2. Integration Test Suite

**Goal:** Verify API endpoints and Database interactions work together correctly.

### Strategy

- **Scope:** API Routes (`app/api/*`) and Database interactions.
- **Database:** Use a temporary/in-memory SQLite database for each test run to ensure isolation.
- **Implementation Steps:**
  1.  Create a test database fixture that:
      - Creates a generic `test.db`.
      - Runs migrations using `drizzle-kit push` or SQL schema execution.
      - Seeds necessary reference data (e.g., default categories).
  2.  Write test helpers to simulate API Requests (Mock `NextRequest`/`NextResponse` if testing handlers directly, or use a library like `supertest` if adapting to standard node server, but for Next.js App Router, direct handler testing with mocked request objects is often easiest).
  3.  **Key Scenarios:**
      - **Habits:** Create habit -> Check DB -> Log completion -> Verify streak updates.
      - **Finance:** Create account -> Add transaction -> Verify balance updates.
      - **Journal:** Create entry -> Search entry (verify FTS5 usage).

## 3. E2E Test Suite (Playwright)

**Goal:** Verify end-to-end user flows in the browser.
**Skill Reference:** `playwright-skill`

### Strategy

- **Tool:** Playwright.
- **Execution:** Headless for CI, Headed for local debugging.
- **Implementation Steps:**
  1.  **Setup:** Initialize Playwright (`npm init playwright@latest`).
  2.  **Server Detection:** Use `playwright-skill` logic to detect running dev server (usually `localhost:3000`).
  3.  **Test Scenarios:**
      - **Smoke Test:** App loads, sidebar renders, navigation works.
      - **Habit Flow:** Create new habit "Drink Water" -> Check it off -> Verify UI update.
      - **Finance Flow:** Log expense -> Check Dashboard total updates.
      - **Vault Flow:** Create file -> Edit content -> Verify autosave/persistence.
  4.  **Helpers:** Create `lib/e2e-helpers.ts` for common actions (login/bypass auth if needed, strict resets).

## 4. Performance Optimization

**Goal:** Ensure snappy interactions and fast load times.
**Skill Reference:** `web-performance-optimization`

### 4.1 Lazy Loading (Code Splitting)

- **Target:** Heavy components that are not immediately visible or needed.
- **Candidates:**
  - `RichTextEditor` (Markdown editor libraries are heavy).
  - `Recharts` (Charting libraries).
  - `Framer Motion` (Animation libraries, if heavy usage).
- **Action:** Use `next/dynamic` with custom loading states.
  ```tsx
  const LazyChart = dynamic(() => import("@/components/charts/TrendChart"), {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false, // Charts often don't need SSR
  });
  ```

### 4.2 Virtualized Lists

- **Target:** Long lists that affect DOM performance.
- **Candidates:**
  - `HabitList` (if user has 50+ habits).
  - `TransactionList` (potentially thousands of rows).
  - `JournalList`.
- **Action:** Implement `react-window` or `@tanstack/react-virtual`.
- **Metric:** Monitor `First Contentful Paint` (FCP) and `Interaction to Next Paint` (INP).

## 5. Accessibility Audit

**Goal:** Ensure the app is usable by everyone.
**Skill Reference:** `accessibility-compliance-accessibility-audit`

### Strategy

- **Tools:**
  - **Automated:** `axe-core` (via `playwright-axe` in E2E tests).
  - **Manual:** Keyboard navigation tab-through.
- **Checklist:**
  - [ ] **Contrast:** Verify colors meet WCAG AA.
  - [ ] **Focus Management:** Ensure modals trap focus, menus close on Escape.
  - [ ] **ARIA Labels:** Ensure icon-only buttons (like "Edit", "Delete") have `aria-label`.
  - [ ] **Semantic HTML:** Use `<button>`, `<nav>`, `<main>`, `<aside>` correctly.

## 6. Documentation (README + Setup)

**Goal:** Make the project easy to onboard and understand.

### Strategy

- **README.md:**
  - Project Goal & Features.
  - Tech Stack (Next.js, Tailwind, SQLite, Tauri).
  - "Getting Started" - precise commands to run locally.
- **docs/ARCHITECTURE.md:** (Already exists, update if needed).
- **docs/CONTRIBUTING.md:** verification steps for PRs (run tests, lint).

## 7. Tauri Compatibility Check

**Goal:** Prepare for Phase 5 (Native Desktop).

### Strategy

- **Database:** Verify `better-sqlite3` vs `tauri-plugin-sql`.
  - _Note:_ `better-sqlite3` requires native compilation. For Tauri, we might need a specific build process or switch to `tauri-plugin-sql` for the native build while keeping `better-sqlite3` for dev/web mode.
  - **Action Plan:** Research "Next.js + Tauri + SQLite" patterns. Likely involves separating the DB interface so we can swap the driver.
- **File System:** Verify `fs` module usage.
  - Next.js runs `fs` on the server (Node.js).
  - Tauri runs backend logic in Rust, but the UI is client-side.
  - **Crucial Check:** Ensure all file operations happen in API routes (Node.js) or Server Actions. When moving to Tauri, these Server Actions might need to become Tauri Commands (Rust) or run a sidecar Node process (less ideal).
  - **Recommendation:** Keep business logic clean and separated to ease migration to Rust commands later if needed, OR use Tauri's sidecar capability to run the Next.js API.

---

**Next Steps:**

1.  Approve this plan.
2.  Begin with **4.1 Unit Test Suite**.
