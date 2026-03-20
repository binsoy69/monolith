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

export type ModuleId = 'dashboard' | 'habits' | 'planner' | 'expenses' | 'settings';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [showShortcuts, setShowShortcuts] = useState(false);
  // Increment to signal HabitsView (and future modules) to open new item form
  const [newItemTrigger, setNewItemTrigger] = useState(0);

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
            <>
              <ModuleHeader moduleId={activeModule} />
              <main style={{ flex: 1, overflow: 'auto' }}>
                <ErrorBoundary moduleName="Planner">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body)' }}>
                      Planner — coming soon
                    </span>
                  </div>
                </ErrorBoundary>
              </main>
            </>
          ) : activeModule === 'expenses' ? (
            <>
              <ModuleHeader moduleId={activeModule} />
              <main style={{ flex: 1, overflow: 'auto' }}>
                <ErrorBoundary moduleName="Expenses">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body)' }}>
                      Expenses — coming soon
                    </span>
                  </div>
                </ErrorBoundary>
              </main>
            </>
          ) : (
            <>
              <ModuleHeader moduleId={activeModule} />
              <main style={{ flex: 1, overflow: 'auto' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  <span style={{
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-body)',
                  }}>
                    Dashboard
                  </span>
                </div>
              </main>
            </>
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
