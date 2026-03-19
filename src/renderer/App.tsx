import { useState } from 'react';
import { Sidebar } from './shell/Sidebar';
import { WindowChrome } from './shell/WindowChrome';
import { ModuleHeader } from './shell/ModuleHeader';
import { SettingsView } from './settings/SettingsView';

export type ModuleId = 'dashboard' | 'habits' | 'planner' | 'expenses' | 'settings';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
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
    </div>
  );
}
