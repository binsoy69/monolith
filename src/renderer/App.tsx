import { useState, useCallback } from 'react';
import { Sidebar } from './shell/Sidebar';
import { WindowChrome } from './shell/WindowChrome';
import { ModuleHeader } from './shell/ModuleHeader';
import { SettingsView } from './settings/SettingsView';
import { KeyboardRouter } from './shell/KeyboardRouter';
import { KeyboardShortcutOverlay } from './shell/KeyboardShortcutOverlay';

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
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}>
                <span style={{
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--font-size-body)',
                }}>
                  {activeModule === 'dashboard' ? 'Dashboard' : 'Coming in Phase 2'}
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
    </div>
  );
}
