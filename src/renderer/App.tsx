import { useState } from 'react';
import { Sidebar } from './shell/Sidebar';
import { WindowChrome } from './shell/WindowChrome';
import { ModuleHeader } from './shell/ModuleHeader';

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
          <main style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Phase 1 placeholder content — replaced in Phase 2 */}
            <span style={{
              color: 'var(--color-text-muted)',
              fontSize: 'var(--font-size-body)',
            }}>
              {activeModule === 'dashboard' ? 'Dashboard' :
               activeModule === 'settings' ? null :
               'Coming in Phase 2'}
            </span>
          </main>
        </div>
      </div>
    </div>
  );
}
