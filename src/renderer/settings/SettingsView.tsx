import { useState, useEffect, useCallback } from 'react';
import { useSettings, useUpdateSettings } from './useSettings';
import type { AppSettings } from '../../shared/ipc-types';

export function SettingsView() {
  const { data: settings, isLoading, isError } = useSettings();
  const updateSettings = useUpdateSettings();
  const [flashField, setFlashField] = useState<string | null>(null);

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
          <select
            value={settings.dateFormat}
            onChange={(e) => handleChange('dateFormat', e.target.value)}
            style={{
              background: 'var(--color-bg-subtle)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              paddingTop: 'var(--space-1)',
              paddingBottom: 'var(--space-1)',
              paddingLeft: 'var(--space-2)',
              paddingRight: 'var(--space-2)',
              fontSize: 'var(--font-size-body)',
              outline: 'none',
              cursor: 'pointer',
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--color-accent)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
              e.currentTarget.style.outlineOffset = '0';
            }}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          </select>
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
              background: 'var(--color-bg-subtle)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              paddingTop: 'var(--space-1)',
              paddingBottom: 'var(--space-1)',
              paddingLeft: 'var(--space-2)',
              paddingRight: 'var(--space-2)',
              fontSize: 'var(--font-size-body)',
              outline: 'none',
              cursor: 'pointer',
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--color-accent)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
              e.currentTarget.style.outlineOffset = '0';
            }}
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
