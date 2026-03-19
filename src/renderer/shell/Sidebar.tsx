import { useState } from 'react';
import { LayoutDashboard, Activity, CheckSquare, Wallet, Settings } from 'lucide-react';
import type { ModuleId } from '../App';

interface SidebarProps {
  activeModule: ModuleId;
  onNavigate: (id: ModuleId) => void;
}

interface NavItem {
  id: ModuleId;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'habits', label: 'Habits', icon: Activity },
  { id: 'planner', label: 'Planner', icon: CheckSquare },
  { id: 'expenses', label: 'Expenses', icon: Wallet },
];

function NavButton({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate: (id: ModuleId) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  const getIconColor = () => {
    if (isActive) return 'var(--color-accent)';
    if (isHovered) return 'var(--color-text-secondary)';
    return 'var(--color-text-muted)';
  };

  const getButtonStyle = (): React.CSSProperties => ({
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
    padding: 0,
    outline: 'none',
    backgroundColor: isActive
      ? 'var(--color-accent-subtle)'
      : isHovered
      ? 'var(--color-bg-subtle)'
      : 'transparent',
    borderRadius: isActive ? '0 var(--radius-md) var(--radius-md) 0' : 'var(--radius-md)',
    transition: `background-color var(--duration-fast) ease-out, color var(--duration-fast) ease-out`,
    boxShadow: isActive ? 'inset 2px 0 0 var(--color-accent)' : 'none',
  });

  return (
    <button
      onClick={() => onNavigate(item.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={item.label}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
      style={getButtonStyle()}
    >
      <Icon size={18} strokeWidth={1.5} color={getIconColor()} />
    </button>
  );
}

export function Sidebar({ activeModule, onNavigate }: SidebarProps) {
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);
  const isSettingsActive = activeModule === 'settings';

  const getSettingsIconColor = () => {
    if (isSettingsActive) return 'var(--color-accent)';
    if (isSettingsHovered) return 'var(--color-text-secondary)';
    return 'var(--color-text-muted)';
  };

  const getSettingsButtonStyle = (): React.CSSProperties => ({
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
    padding: 0,
    outline: 'none',
    backgroundColor: isSettingsActive
      ? 'var(--color-accent-subtle)'
      : isSettingsHovered
      ? 'var(--color-bg-subtle)'
      : 'transparent',
    borderRadius: isSettingsActive ? '0 var(--radius-md) var(--radius-md) 0' : 'var(--radius-md)',
    transition: `background-color var(--duration-fast) ease-out, color var(--duration-fast) ease-out`,
    boxShadow: isSettingsActive ? 'inset 2px 0 0 var(--color-accent)' : 'none',
  });

  return (
    <nav
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--color-bg-elevated)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 'var(--space-2)',
        paddingBottom: 'var(--space-2)',
        flexShrink: 0,
        overflow: 'hidden',
      }}
      aria-label="Main navigation"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2)',
          width: '100%',
          paddingLeft: '4px',
          paddingRight: '4px',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeModule === item.id}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: 'auto',
          width: '100%',
          paddingLeft: '4px',
          paddingRight: '4px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={() => onNavigate('settings')}
          onMouseEnter={() => setIsSettingsHovered(true)}
          onMouseLeave={() => setIsSettingsHovered(false)}
          title="Settings"
          aria-label="Settings"
          aria-current={isSettingsActive ? 'page' : undefined}
          style={getSettingsButtonStyle()}
        >
          <Settings size={18} strokeWidth={1.5} color={getSettingsIconColor()} />
        </button>
      </div>
    </nav>
  );
}
