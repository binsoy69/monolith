import { ipcMain } from 'electron'

export function registerAllHandlers(): void {
  // Settings handlers will be registered from Plan 03 (electron-store)
  // This file is the single entry point for all IPC handler registration

  // Placeholder to prevent "no handlers registered" — settings:get returns null until Plan 03
  ipcMain.handle('settings:get', () => {
    return {
      dateFormat: 'DD/MM/YYYY',
      notificationTime: '09:00'
    }
  })

  ipcMain.handle('settings:set', () => {
    // Implemented in Plan 03 with electron-store
  })
}
