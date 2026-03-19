---
phase: 01-foundation
plan: "04"
subsystem: shell/keyboard
tags: [keyboard-routing, keyboard-shortcuts, overlay, shell, UX]
dependency_graph:
  requires: ["01-03"]
  provides: ["keyboard-router", "shortcut-overlay"]
  affects: ["App.tsx", "shell"]
tech_stack:
  added: []
  patterns: ["document-level keydown handler", "behavior-only null-returning component", "Escape hierarchy", "click-outside-to-close with setTimeout guard"]
key_files:
  created:
    - src/renderer/shell/KeyboardRouter.tsx
    - src/renderer/shell/KeyboardShortcutOverlay.tsx
  modified:
    - src/renderer/App.tsx
    - src/renderer/shared/styles/globals.css
decisions:
  - "KeyboardRouter returns null — pure behavior component with no DOM output"
  - "Alt+1-4 and Escape fire even when user is in an input/textarea; ? is blocked by isEditing guard"
  - "Escape hierarchy: closes overlay first, then navigates to dashboard if nothing is open"
  - "Click-outside uses setTimeout(0) to avoid immediate close from the ? keypress that opened it"
  - "Overlay z-index: 100 sits above all shell content without needing a portal"
  - "fadeIn keyframe added to globals.css (not component inline) to keep CSS in one place"
metrics:
  duration_minutes: 2
  completed_date: "2026-03-20"
  tasks_completed: 2
  files_created: 2
  files_modified: 2
requirements_satisfied:
  - SHELL-05
---

# Phase 01 Plan 04: Keyboard Router and Shortcut Overlay Summary

Global keyboard routing and shortcut overlay modal wired into the shell — Alt+1-4 module switching, ? overlay with Navigation/Global sections, and Escape hierarchy that respects open modals.

## What Was Built

### KeyboardRouter (src/renderer/shell/KeyboardRouter.tsx)

A behavior-only React component (returns null) that attaches a single `keydown` listener at the document level. Handles three shortcut categories:

- **Alt+1-4** — always fires, even in text inputs (module switching is global)
- **Escape** — always fires, even in text inputs (delegated to `onEscape` callback)
- **?** — fires only when the target is not INPUT, TEXTAREA, SELECT, or contentEditable

The component uses `useCallback` to stabilize the handler reference and `useEffect` to manage the event listener lifecycle with proper cleanup.

### KeyboardShortcutOverlay (src/renderer/shell/KeyboardShortcutOverlay.tsx)

A centered modal overlay (480px wide) that renders when `isOpen` is true. Shows two sections:

- **Navigation:** Alt+1 Dashboard, Alt+2 Habits, Alt+3 Planner, Alt+4 Expenses
- **Global:** ? (This overlay), Esc (Close / Go to Dashboard)

Key badges use `var(--color-accent-subtle)` background with `rgba(99, 102, 241, 0.3)` border, `var(--font-size-small)` text, and `var(--radius-sm)` border-radius per UI-SPEC. Click-outside via `mousedown` listener uses a `setTimeout(0)` guard to prevent the same `?` keypress that opens the overlay from immediately closing it.

### App.tsx updates

Added `showShortcuts` state and `handleEscape` callback (with `useCallback`). `handleEscape` implements the Escape hierarchy: close overlay first, then navigate to dashboard. `KeyboardRouter` is rendered before `WindowChrome` (pure behavior, position irrelevant). `KeyboardShortcutOverlay` is rendered as the last child so it overlays all content via `position: fixed`.

### globals.css

Added `@keyframes fadeIn` animation at the end of the file. Used by the overlay backdrop `animation` property for the 150ms ease-out open transition.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Create KeyboardRouter and KeyboardShortcutOverlay | f055424 | KeyboardRouter.tsx, KeyboardShortcutOverlay.tsx |
| 2 | Wire into App.tsx, add fadeIn keyframe | a2aeb9c | App.tsx, globals.css |

## Verification

- `npx tsc --noEmit` — 0 errors after each task
- `npm run build` — succeeds, renderer bundle built in 2.79s
- All acceptance criteria from both tasks satisfied

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All created files exist. All task commits verified in git log.

| Check | Result |
|-------|--------|
| src/renderer/shell/KeyboardRouter.tsx | FOUND |
| src/renderer/shell/KeyboardShortcutOverlay.tsx | FOUND |
| src/renderer/App.tsx | FOUND |
| src/renderer/shared/styles/globals.css | FOUND |
| .planning/phases/01-foundation/01-04-SUMMARY.md | FOUND |
| Commit f055424 (Task 1) | FOUND |
| Commit a2aeb9c (Task 2) | FOUND |
