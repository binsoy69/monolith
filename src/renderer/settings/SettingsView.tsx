import { useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSettings, useUpdateSettings } from './useSettings';
import type { AppSettings } from '../../shared/ipc-types';

const controlBase: React.CSSProperties = {
  background: 'var(--color-bg-overlay)',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  paddingTop: 'var(--space-1)',
  paddingBottom: 'var(--space-1)',
  paddingLeft: 'var(--space-2)',
  paddingRight: 'var(--space-2)',
  fontSize: 'var(--font-size-body)',
  fontFamily: 'inherit',
  outline: 'none',
  cursor: 'pointer',
  transition: `background var(--duration-normal) ease, border-color var(--duration-normal) ease, box-shadow var(--duration-normal) ease`,
};

function useControlHandlers() {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
      e.currentTarget.style.background = 'var(--color-bg-subtle)';
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      if (document.activeElement !== e.currentTarget) {
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.background = 'var(--color-bg-overlay)';
      }
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      e.currentTarget.style.borderColor = 'var(--color-accent)';
      e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent-subtle)';
      e.currentTarget.style.background = 'var(--color-bg-subtle)';
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      e.currentTarget.style.borderColor = '';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.background = 'var(--color-bg-overlay)';
    },
  };
}

export function SettingsView() {
  const { data: settings, isLoading, isError } = useSettings();
  const updateSettings = useUpdateSettings();
  const [flashField, setFlashField] = useState<string | null>(null);
  const controlHandlers = useControlHandlers();

  const handleChange = useCallback(
    (field: keyof AppSettings, value: string) => {
      updateSettings.mutate({ [field]: value });
      setFlashField(field);
    },
    [updateSettings],
  );

  useEffect(() => {
    if (flashField) {
      const timer = setTimeout(() => setFlashField(null), 450);
      return () => clearTimeout(timer);
    }
  }, [flashField]);

  if (isError) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-body)',
        }}
      >
        Could not load settings. Restart the app to retry.
      </div>
    );
  }

  if (isLoading || !settings) {
    return null;
  }

  return (
    <div
      style={{
        maxWidth: 560,
        margin: '0 auto',
        width: '100%',
        paddingTop: 'var(--space-4)',
      }}
    >
      {/* General section */}
      <SettingsSection title="General" isFirst>
        <SettingRow label="Date Format" flashActive={flashField === 'dateFormat'}>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              style={{
                ...controlBase,
                appearance: 'none',
                paddingRight: 28,
                minWidth: 130,
              }}
              {...controlHandlers}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </select>
            <ChevronDown
              size={14}
              strokeWidth={1.5}
              style={{
                position: 'absolute',
                right: 8,
                pointerEvents: 'none',
                color: 'var(--color-text-muted)',
              }}
            />
          </div>
        </SettingRow>
      </SettingsSection>

      {/* Notifications section */}
      <SettingsSection title="Notifications">
        <SettingRow label="Habit Reminder" flashActive={flashField === 'notificationTime'}>
          <input
            type="time"
            value={settings.notificationTime}
            onChange={(e) => handleChange('notificationTime', e.target.value)}
            style={{
              ...controlBase,
              colorScheme: 'dark',
              minWidth: 130,
            }}
            {...controlHandlers}
          />
        </SettingRow>
      </SettingsSection>
    </div>
  );
}

function SettingsSection({
  title,
  isFirst,
  children,
}: {
  title: string;
  isFirst?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        paddingTop: isFirst ? 'var(--space-4)' : 'var(--space-6)',
        borderTop: isFirst ? 'none' : '1px solid var(--color-border)',
        marginTop: isFirst ? 0 : 'var(--space-6)',
      }}
    >
      <h3
        style={{
          fontSize: 'var(--font-size-body)',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: 0,
          paddingBottom: 'var(--space-4)',
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function SettingRow({
  label,
  flashActive,
  children,
}: {
  label: string;
  flashActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 44,
        paddingLeft: 'var(--space-4)',
        paddingRight: 'var(--space-4)',
        borderRadius: 'var(--radius-md)',
        transition: `background var(--duration-normal) ease-out`,
        backgroundColor: flashActive ? 'var(--color-accent-subtle)' : 'transparent',
      }}
    >
      <label
        style={{
          fontSize: 'var(--font-size-body)',
          fontWeight: 400,
          color: 'var(--color-text-primary)',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
