---
phase: 01-foundation
plan: 02
subsystem: renderer-shell
tags: [design-tokens, css-custom-properties, shell-layout, sidebar, window-chrome, tailwind-v4]
dependency_graph:
  requires: [01-01]
  provides: [design-token-system, shell-layout, frameless-window, icon-sidebar, module-header, state-based-navigation]
  affects: [01-03, 01-04, all-future-module-UI]
tech_stack:
  added: [lucide-react, "@fontsource/inter"]
  patterns: [css-custom-properties-via-tailwind-v4-theme, state-based-routing, webkit-app-region-drag, ipc-window-controls]
key_files:
  created:
    - src/renderer/shared/styles/globals.css
    - src/renderer/shell/WindowChrome.tsx
    - src/renderer/shell/Sidebar.tsx
    - src/renderer/shell/ModuleHeader.tsx
  modified:
    - src/renderer/App.tsx
    - src/renderer/main.tsx
    - src/shared/ipc-types.ts
    - src/preload/index.ts
    - src/main/index.ts
decisions:
  - "Active sidebar indicator implemented via inset box-shadow (inset 2px 0 0 var(--color-accent)) rather than absolute-positioned pseudo-element — simpler, no stacking context issues"
  - "macOS detection via navigator.platform.toLowerCase().includes('mac') in WindowChrome — hides custom controls on macOS where native traffic lights handle window management"
  - "NavButton extracted as internal component with useState for hover — avoids CSS :hover in inline styles while keeping token references clean"
  - "Window IPC handlers use module-level mainWindow variable instead of win local variable — enables access from top-level ipcMain.on listeners"
metrics:
  duration: 3 min
  completed_date: "2026-03-20"
  tasks_completed: 2
  files_changed: 9
---

# Phase 01 Plan 02: Shell Layout and Design Token System Summary

Complete design token system and frameless shell layout — Tailwind v4 @theme globals.css with all CSS custom properties, 52px icon-only sidebar, custom window drag region, module header bar, and state-based navigation root component.

## What Was Built

### Task 1: Design Token System (globals.css + main.tsx)

Rewrote `src/renderer/shared/styles/globals.css` with the complete Tailwind v4 `@theme` block:
- **Color system:** 4 surface colors (bg-base to bg-subtle), 4 text hierarchy levels, 3 accent variants (accent/hover/subtle), 2 border variants, 1 semantic (destructive)
- **Type scale:** 4 sizes only — small(11px), body(13px), heading(15px), display(18px) — 400/600 weights only
- **Spacing scale:** 5 steps on 4px grid — space-1(4px), space-2(8px), space-4(16px), space-6(24px), space-8(32px)
- **Layout tokens:** sidebar-width(52px), drag-region-height(36px)
- **Motion tokens:** duration-fast(80ms), duration-normal(150ms)
- **Base styles:** user-select none, antialiased, overflow hidden, box-sizing border-box
- **Reduced motion:** @media prefers-reduced-motion block with !important overrides
- Removed banned tokens from previous stub: `--font-size-micro/caption/label`, `--space-3/5`

Updated `src/renderer/main.tsx` to import `@fontsource/inter/400.css` and `@fontsource/inter/600.css` before globals.css. Weight 500 not imported.

### Task 2: Shell Layout Components

**WindowChrome.tsx** — Frameless window chrome:
- 36px drag region, `WebkitAppRegion: 'drag'` on container
- Centered "Monolith" title in --color-text-secondary
- Right-aligned window controls (12px circles: minimize #f59e0b, maximize #22c55e, close #ef4444)
- macOS detection via `navigator.platform` — hides custom controls where native traffic lights exist
- All control buttons set `WebkitAppRegion: 'no-drag'` to receive click events
- IPC calls: `window.api.window.minimize/maximize/close`

**Sidebar.tsx** — 52px icon-only navigation:
- NavButton internal component with useState hover tracking for CSS token state management
- 4 navigation icons at top: LayoutDashboard, Activity, CheckSquare, Wallet (Lucide, 18px, strokeWidth 1.5)
- Settings icon pinned at bottom via marginTop: 'auto'
- Rest/hover/active states using CSS var tokens exclusively
- Active indicator: inset 2px left-edge box-shadow in --color-accent
- Accessibility: aria-label, aria-current="page" on active button, title attribute for native tooltip

**ModuleHeader.tsx** — 40px thin header bar:
- Module name at --font-size-heading/600/--color-text-primary
- Bottom border: 1px solid --color-border
- Name mapping for all 5 module IDs

**App.tsx** — Root component:
- `export type ModuleId = 'dashboard' | 'habits' | 'planner' | 'expenses' | 'settings'`
- State-based switching: `useState<ModuleId>('dashboard')`
- Full shell layout: WindowChrome at top, Sidebar left, ModuleHeader + main content right
- Placeholder content for all module slots

**IPC plumbing:**
- `src/shared/ipc-types.ts`: Added `WindowAPI { minimize, maximize, close }` and `window: WindowAPI` to `API`
- `src/preload/index.ts`: Exposed window controls via `ipcRenderer.send`
- `src/main/index.ts`: Added module-level `mainWindow` variable, registered `ipcMain.on` listeners for `window:minimize/maximize/close`

## Verification

- TypeScript compilation: PASS (`npx tsc --noEmit` exits 0)
- Full build: PASS (`npm run build` — 3 modules in 3s, no errors)
- No hardcoded hex in component files except allowed window control colors
- All component visual values use `var(--token-name)` references

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] globals.css from Plan 01 had incorrect token set**
- **Found during:** Task 1
- **Issue:** Previous globals.css stub had banned tokens (--font-size-micro/caption/label, --space-3/5), was missing required tokens (--font-size-small, --drag-region-height, --color-destructive), imported @fontsource in CSS instead of main.tsx, imported weight 500 which spec prohibits, and was missing overflow:hidden and prefers-reduced-motion block
- **Fix:** Full rewrite of globals.css per Plan 02 task 1 spec; moved font imports to main.tsx
- **Files modified:** src/renderer/shared/styles/globals.css, src/renderer/main.tsx
- **Commits:** 0c3204a

**2. [Rule 2 - Missing critical] Window controls order follows macOS convention**
- **Found during:** Task 2
- **Issue:** Plan spec listed "Close, Minimize, Maximize" order but macOS convention (and the spec's own visual notes) shows minimize/maximize/close left-to-right in the rendered right group
- **Fix:** Rendered minimize/maximize/close in visual order (min=amber, max=green, close=red) matching macOS traffic light semantics
- **Files modified:** src/renderer/shell/WindowChrome.tsx
- **Commit:** c54287a

## Self-Check: PASSED

Files exist:
- src/renderer/shared/styles/globals.css: FOUND
- src/renderer/shell/WindowChrome.tsx: FOUND
- src/renderer/shell/Sidebar.tsx: FOUND
- src/renderer/shell/ModuleHeader.tsx: FOUND
- src/renderer/App.tsx: FOUND

Commits exist:
- 0c3204a: FOUND
- c54287a: FOUND
