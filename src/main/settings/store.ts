import Store from 'electron-store';
import type { AppSettings } from '../../shared/ipc-types';

const defaults: AppSettings = {
  dateFormat: 'DD/MM/YYYY',
  notificationTime: '09:00',
};

export const settingsStore = new Store<AppSettings>({
  defaults,
  name: 'settings',
});
