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

  const handleEscape = useCallback(() => {
    if (showShortcuts) {
      setShowShortcuts(false);
      return;
    }
    if (activeModule !== 'dashboard') {
      setActiveModule('dashboard');
    }
  }, [showShortcuts, activeModule]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <KeyboardRouter
        onNavigate={setActiveModule}
        onShowShortcuts={() => setShowShortcuts(true)}
        onEscape={handleEscape}
      />
      <WindowChrome />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar activeModule={activeModule} onNavigate={setActiveModule} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ModuleHeader moduleId={activeModule} />
          <main style={{ flex: 1, overflow: 'auto' }}>
            {activeModule === 'settings' ? (
              <SettingsView />
            ) : activeModule === 'habits' ? (
              <ErrorBoundary moduleName="Habits">
                <HabitsView />
              </ErrorBoundary>
            ) : activeModule === 'planner' ? (
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
            ) : activeModule === 'expenses' ? (
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
            ) : (
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
            )}
          </main>
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
