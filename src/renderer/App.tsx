import { useState, useCallback } from 'react';
import { Sidebar } from './shell/Sidebar';
import { WindowChrome } from './shell/WindowChrome';
import { ModuleHeader } from './shell/ModuleHeader';
import { SettingsView } from './settings/SettingsView';
import { KeyboardRouter } from './shell/KeyboardRouter';
import { KeyboardShortcutOverlay } from './shell/KeyboardShortcutOverlay';
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
  // Increment to signal HabitsView (and future modules) to open new item form
  const [newItemTrigger, setNewItemTrigger] = useState(0);

  const plannerNavigateDay = usePlannerStore((s) => s.navigateDay);
  const plannerGoToToday = usePlannerStore((s) => s.goToToday);

  const handleEscape = useCallback(() => {
    if (showShortcuts) {
      setShowShortcuts(false);
      return;
    }
    if (activeModule !== 'dashboard') {
      setActiveModule('dashboard');
    }
  }, [showShortcuts, activeModule]);

  const handleNewItem = useCallback(() => {
    // Trigger add action for the currently active module:
    // - habits: opens inline create form
    // - planner: will focus quick-add input (wired in plan 02-04)
    // - expenses: will open expense modal (wired in plan 02-05)
    setNewItemTrigger((n) => n + 1);
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
                <PlannerView />
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
      <ToastContainer />
    </div>
  );
}
