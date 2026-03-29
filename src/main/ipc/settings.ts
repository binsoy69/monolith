import { ipcMain } from 'electron';
import { getStore } from '../settings/store';
import type { StoredAppSettings } from '../settings/store';
import type { AppSettings } from '../../shared/ipc-types';

const PUBLIC_SETTING_KEYS = [
  'dateFormat',
  'notificationTime',
  'notificationsEnabled',
  'windowBounds',
] as const;

type PublicSettingKey = (typeof PUBLIC_SETTING_KEYS)[number];

function pickPublicSettings(storeValues: StoredAppSettings): AppSettings {
  return {
    dateFormat: storeValues.dateFormat as AppSettings['dateFormat'],
    notificationTime: storeValues.notificationTime as string,
    notificationsEnabled: storeValues.notificationsEnabled as boolean,
    windowBounds: storeValues.windowBounds as AppSettings['windowBounds'],
  };
}

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', async (): Promise<AppSettings> => {
    const store = await getStore();
    return pickPublicSettings(store.store as StoredAppSettings);
  });

  ipcMain.handle('settings:set', async (_, updates: Partial<AppSettings>): Promise<void> => {
    const store = await getStore();
    for (const [key, value] of Object.entries(updates)) {
      if (PUBLIC_SETTING_KEYS.includes(key as PublicSettingKey)) {
        store.set(key as PublicSettingKey, value);
      }
    }
  });
}
