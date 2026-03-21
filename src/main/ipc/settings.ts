import { ipcMain } from 'electron';
import { getStore } from '../settings/store';
import type { AppSettings } from '../../shared/ipc-types';

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', async (): Promise<AppSettings> => {
    const store = await getStore();
    return store.store as AppSettings;
  });

  ipcMain.handle('settings:set', async (_, updates: Partial<AppSettings>): Promise<void> => {
    const store = await getStore();
    for (const [key, value] of Object.entries(updates)) {
      store.set(key as keyof AppSettings, value);
    }
  });
}
