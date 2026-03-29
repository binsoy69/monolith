import type Store from 'electron-store';
import type { AppSettings } from '../../shared/ipc-types';

export type StoredAppSettings = AppSettings & { _lastHabitReminderDate?: string };

const defaults: StoredAppSettings = {
  dateFormat: 'DD/MM/YYYY',
  notificationTime: '09:00',
  notificationsEnabled: false,
  _lastHabitReminderDate: '',
};

let _store: Store<StoredAppSettings> | null = null;

async function getStore(): Promise<Store<StoredAppSettings>> {
  if (!_store) {
    const { default: Store } = await import('electron-store');
    _store = new Store<StoredAppSettings>({ defaults, name: 'settings' });
  }
  return _store;
}

export { getStore };
