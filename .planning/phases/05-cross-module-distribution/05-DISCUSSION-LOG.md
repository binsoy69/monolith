# Phase 5: Cross-Module + Distribution - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 05-cross-module-distribution
**Areas discussed:** Tag system design, Global search scope, Notification behavior, Packaging & distribution

---

## Tag System Design

### Tag Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Shared tag pool | One global set of tags across all modules. Simplest model, enables cross-module filtering. | ✓ |
| Per-module tags | Each module has its own tag namespace. More isolation but cross-module view harder. | |
| Shared pool + module colors | Global tags with module-specific accent colors. | |

**User's choice:** Shared tag pool
**Notes:** None

### Tag Application Method

| Option | Description | Selected |
|--------|-------------|----------|
| Context menu | Right-click -> "Tags" submenu. Consistent with existing priority pattern. | ✓ |
| Inline tag chips | Click '+' button on each row. More discoverable but adds visual clutter. | |
| Both context menu + inline | Two entry points for power users and discoverers. | |

**User's choice:** Context menu
**Notes:** None

### Cross-Module Tag View

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar entry | New "Tags" section in sidebar. Click tag to see unified list. | ✓ |
| Command palette filter | Type "tag:health" in Ctrl+K. No separate view. | |
| Dashboard tag section | Tags as filter chips on dashboard. | |

**User's choice:** Sidebar entry
**Notes:** None

### Tag Colors

| Option | Description | Selected |
|--------|-------------|----------|
| User-assigned from palette | User picks colors similar to expense categories. | |
| No color, text only | Monochrome pills. Clean dense aesthetic. | |
| Auto-assigned colors | System assigns from fixed palette by creation order. | ✓ |

**User's choice:** Auto-assigned colors
**Notes:** None

---

## Global Search Scope

### Relationship to Ctrl+K

| Option | Description | Selected |
|--------|-------------|----------|
| Extend Ctrl+K | Unified palette: search + quick-actions. Type to search across all data. | ✓ |
| Separate search (Ctrl+/) | Keep Ctrl+K for actions, new shortcut for search. | |
| Replace Ctrl+K entirely | Pure search, actions move to other shortcuts. | |

**User's choice:** Extend Ctrl+K
**Notes:** None

### Search Result Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Navigate to item | Select result -> navigate to module/date. Palette closes. | ✓ |
| Show inline preview | Expand preview panel inside palette. Explicit "Go to" needed. | |
| Copy to clipboard | Copy item details. Unusual for productivity app. | |

**User's choice:** Navigate to item
**Notes:** None

### Daily Notes in Search

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, full-text search notes | Notes searchable. Results show snippet + date. | ✓ |
| No, only structured data | Search only habits/tasks/expenses. | |

**User's choice:** Yes, full-text search notes
**Notes:** None

---

## Notification Behavior

### Notification Content

| Option | Description | Selected |
|--------|-------------|----------|
| Count summary | "3 habits unchecked today". Click opens Habits view. | ✓ |
| Individual per habit | One notification per unchecked habit. Potentially spammy. | |
| Summary + names | Single notification listing unchecked habit names. | |

**User's choice:** Count summary
**Notes:** None

### Repeat Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Fire once at scheduled time | One notification per day. No repeat. | ✓ |
| Repeat every hour | Re-fire hourly until all done. More aggressive. | |
| Fire twice (morning + evening) | Two fixed windows with 4-hour gap. | |

**User's choice:** Fire once at scheduled time
**Notes:** None

### Enable/Disable Toggle

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle in Settings | On/off toggle next to time picker. Off by default. | ✓ |
| Always on if time is set | Clear time value to disable. No separate toggle. | |

**User's choice:** Toggle in Settings
**Notes:** None

---

## Packaging & Distribution

### Target Platforms

| Option | Description | Selected |
|--------|-------------|----------|
| Windows only | Ship Windows installer first. macOS/Linux follow later. | ✓ |
| Windows + macOS | Both platforms at once. Requires Apple Developer cert. | |
| All three | Win/Mac/Linux simultaneously. Most CI complexity. | |

**User's choice:** Windows only
**Notes:** None

### Installer Format

| Option | Description | Selected |
|--------|-------------|----------|
| NSIS installer | Traditional .exe installer with wizard. electron-builder native. | ✓ |
| MSI package | Windows Installer. Better for enterprise but more complex. | |
| Portable (no install) | Standalone .exe. No Start menu entry. | |

**User's choice:** NSIS installer
**Notes:** None

### Auto-Update

| Option | Description | Selected |
|--------|-------------|----------|
| Check on startup | electron-updater + GitHub Releases. Background download, prompt restart. | ✓ |
| Manual updates only | User downloads new versions manually. | |
| Defer to v2 | Skip auto-update for v1. | |

**User's choice:** Check on startup
**Notes:** None

### Code Signing

| Option | Description | Selected |
|--------|-------------|----------|
| Skip signing for now | Ship unsigned. SmartScreen warns but works. Add signing later. | ✓ |
| Self-signed certificate | Establishes pipeline but still triggers SmartScreen. | |
| Have a certificate | Ready to use existing cert. | |

**User's choice:** Skip signing for now
**Notes:** None

---

## Claude's Discretion

- Tag chip visual styling (pill shape, size, font)
- Fixed color palette for auto-assigned tag colors
- Search result grouping and ranking in extended Ctrl+K
- NSIS installer customization details
- Auto-update UI treatment

## Deferred Ideas

None
