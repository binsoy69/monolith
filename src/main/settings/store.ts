import type { AppSettings } from '../../shared/ipc-types';

const defaults: AppSettings = {
  dateFormat: 'DD/MM/YYYY',
  notificationTime: '09:00',
};

let _store: any | null = null;

async function getStore(): Promise<any> {
  if (!_store) {
    const { default: Store } = await import('electron-store');
    _store = new Store<AppSettings>({ defaults, name: 'settings' });
  }
  return _store;
}

export { getStore };
