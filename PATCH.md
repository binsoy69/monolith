# Monolith v0.4.0 - UI/UX Overhaul

## Progress Tracker

- [x] Task 1: Fix Habit Category Creation
- [x] Task 2: Habit Consistency Graph (GitHub-style)
- [x] Task 3: VSCode-Inspired Themes (8 total)
- [x] Task 4: Auto-Dock Sidebar
- [x] Task 5: Journal Mood Enhancement
- [x] Task 6: Finance Module Improvements
- [x] Task 7: Overall UI/UX Polish

## Changelog

### Task 1: Fix Habit Category Creation
- Created `src/components/habits/CategoryFormDialog.tsx` - Dialog with name input and color picker grid (12 preset colors)
- Modified `src/components/habits/HabitFormDialog.tsx` - Added "+" button next to category dropdown to open CategoryFormDialog
- Modified `src/components/habits/HabitList.tsx` - Passed `onCategoryCreated` callback to refresh categories after creation

### Task 4: Auto-Dock Sidebar
- Rewrote `src/components/layout/Sidebar.tsx` - Auto-collapses to icon-only mode, expands on hover
- Added `isPinned` state (Ctrl+B toggles pin), `isHovered` state for mouse events
- Shows "M" logo when collapsed, full "Monolith" when expanded
- Pin/Unpin button in header, active nav items get left border accent
- Tooltips on nav icons when collapsed

### Task 3: VSCode-Inspired Themes (8 total)
- Added 6 new theme CSS variable blocks to `src/app/globals.css`: Tokyo Night, Monokai, Abyss, Dracula, One Dark Pro, Nord
- Updated `src/app/providers.tsx` - Multi-theme support with named themes array
- Created `src/components/settings/ThemePicker.tsx` - Visual theme selection grid with color previews
- Updated `src/app/(dashboard)/settings/page.tsx` - Replaced static appearance text with ThemePicker
- Updated `src/components/layout/TopBar.tsx` - Theme dropdown now shows all 8 themes with checkmarks

### Task 2: Habit Consistency Graph (GitHub-style)
- Rewrote `src/components/habits/StreakGraph.tsx` - GitHub-style contribution graph with intensity levels, month/day labels, legend
- Created `src/app/api/habits/consistency/route.ts` - API endpoint returning date->count map for all habits
- Updated `src/components/habits/HabitList.tsx` - Added consistency graph card at top of habits listing page
- Updated `src/components/habits/HabitDetail.tsx` - Added `onCategoryCreated` callback to edit form

### Task 6: Finance Module Improvements
- Rewrote `src/components/finance/CategoryPieChart.tsx` - Donut chart with center total, custom tooltip, sorted legend below
- Rewrote `src/components/finance/MonthlySummaryCard.tsx` - Cards with left border accents, icon badges, trend indicators with % change
- Updated `src/components/finance/FinanceOverview.tsx` - Fetches previous month data for trend comparison, cleaner data flow

### Task 5: Journal Mood Enhancement
- Updated `src/components/journal/JournalCard.tsx` - Mood emoji displayed larger (2xl) with label, positioned as leading indicator
- Added `getMoodLabel()` export to `src/components/journal/MoodPicker.tsx`

### Task 7: Overall UI/UX Polish
- Updated `src/components/ui/card.tsx` - Added hover shadow transition (`hover:shadow-md transition-shadow`)
- Updated `src/app/globals.css` - Added button press feedback, focus-visible ring, smooth page transitions
- Sidebar active items now use left border accent indicator (done in Task 4)
