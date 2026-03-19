import { ipcMain } from 'electron';
import { settingsStore } from '../settings/store';
import type { AppSettings } from '../../shared/ipc-types';

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', (): AppSettings => {
    return settingsStore.store as AppSettings;
  });

  ipcMain.handle('settings:set', (_, updates: Partial<AppSettings>): void => {
    for (const [key, value] of Object.entries(updates)) {
      settingsStore.set(key as keyof AppSettings, value);
    }
  });
}
