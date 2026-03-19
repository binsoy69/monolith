import type { ModuleId } from '../App';

interface ModuleHeaderProps {
  moduleId: ModuleId;
}

const MODULE_NAMES: Record<ModuleId, string> = {
  dashboard: 'Dashboard',
  habits: 'Habits',
  planner: 'Planner',
  expenses: 'Expenses',
  settings: 'Settings',
};

export function ModuleHeader({ moduleId }: ModuleHeaderProps) {
  return (
    <div
      style={{
        height: '40px',
        backgroundColor: 'var(--color-bg-base)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 'var(--space-4)',
        paddingRight: 'var(--space-4)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 'var(--font-size-heading)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--line-height-tight)',
        }}
      >
        {MODULE_NAMES[moduleId]}
      </span>
    </div>
  );
}
