import { useState, useCallback } from 'react';
import { Sidebar } from './shell/Sidebar';
import { WindowChrome } from './shell/WindowChrome';
import { ModuleHeader } from './shell/ModuleHeader';
import { SettingsView } from './settings/SettingsView';
import { KeyboardRouter } from './shell/KeyboardRouter';
import { KeyboardShortcutOverlay } from './shell/KeyboardShortcutOverlay';
import { CommandPalette } from './shell/CommandPalette';
import type { PaletteAction } from './shell/CommandPalette';
import { ErrorBoundary } from './shared/ErrorBoundary';
import { ToastContainer } from './shared/ToastContainer';
import { HabitsView } from './habits/HabitsView';
import { PlannerView } from './planner/PlannerView';
import { ExpensesView } from './expenses/ExpensesView';
import { DashboardView } from './dashboard/DashboardView';
import { usePlannerStore } from './planner/planner-store';

export type ModuleId = 'dashboard' | 'habits' | 'planner' | 'expenses' | 'settings';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  // Increment to signal HabitsView (and future modules) to open new item form
  const [newItemTrigger, setNewItemTrigger] = useState(0);

  const plannerNavigateDay = usePlannerStore((s) => s.navigateDay);
  const plannerGoToToday = usePlannerStore((s) => s.goToToday);

  const handleEscape = useCallback(() => {
    if (showCommandPalette) { setShowCommandPalette(false); return; }
    if (showShortcuts) {
      setShowShortcuts(false);
      return;
    }
    if (activeModule !== 'dashboard') {
      setActiveModule('dashboard');
    }
  }, [showCommandPalette, showShortcuts, activeModule]);

  const handleNewItem = useCallback(() => {
    // Trigger add action for the currently active module:
    // - habits: opens inline create form
    // - planner: focuses quick-add input
    // - expenses: opens expense modal
    setNewItemTrigger((n) => n + 1);
  }, []);

  const handlePaletteAction = useCallback((action: PaletteAction) => {
    setShowCommandPalette(false);
    switch (action) {
      case 'add-task':
        setActiveModule('planner');
        setNewItemTrigger((n) => n + 1);
        break;
      case 'log-expense':
        setActiveModule('expenses');
        setNewItemTrigger((n) => n + 1);
        break;
      case 'check-habit':
        setActiveModule('habits');
        setNewItemTrigger((n) => n + 1);
        break;
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <KeyboardRouter
        onNavigate={setActiveModule}
        onShowShortcuts={() => setShowShortcuts(true)}
        onEscape={handleEscape}
        activeModule={activeModule}
        onNewItem={handleNewItem}
        onNavigateDay={plannerNavigateDay}
        onGoToToday={plannerGoToToday}
        onCommandPalette={() => setShowCommandPalette(true)}
      />
      <WindowChrome />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar activeModule={activeModule} onNavigate={setActiveModule} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeModule === 'settings' ? (
            <>
              <ModuleHeader moduleId={activeModule} />
              <main style={{ flex: 1, overflow: 'auto' }}>
                <SettingsView />
              </main>
            </>
          ) : activeModule === 'habits' ? (
            <ErrorBoundary moduleName="Habits">
              <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <HabitsView newItemTrigger={newItemTrigger} />
              </main>
            </ErrorBoundary>
          ) : activeModule === 'planner' ? (
            <ErrorBoundary moduleName="Planner">
              <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <PlannerView newItemTrigger={newItemTrigger} />
              </main>
            </ErrorBoundary>
          ) : activeModule === 'expenses' ? (
            <ErrorBoundary moduleName="Expenses">
              <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <ExpensesView newItemTrigger={newItemTrigger} />
              </main>
            </ErrorBoundary>
          ) : (
            <ErrorBoundary moduleName="Dashboard">
              <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <DashboardView onNavigate={setActiveModule} />
              </main>
            </ErrorBoundary>
          )}
        </div>
      </div>
      <KeyboardShortcutOverlay
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onAction={handlePaletteAction}
      />
      <ToastContainer />
    </div>
  );
}
