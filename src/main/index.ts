import { app, BrowserWindow, ipcMain } from 'electron'
import { appendFileSync } from 'fs'
import { join } from 'path'
import { getDb, closeDb } from './db/connection'
import { registerAllHandlers } from './ipc/index'
import { HabitReminderService } from './services/HabitReminderService'
import { AppUpdater } from './services/AppUpdater'
import { getStore } from './settings/store'

if (!app.isPackaged) {
  app.setName('Monolith Dev')
  app.setPath('userData', join(app.getPath('appData'), 'Monolith Dev'))
}

function logStartup(message: string, error?: unknown): void {
  if (!app.isPackaged) {
    return
  }

  const detail =
    error instanceof Error
      ? `\n${error.stack ?? error.message}`
      : error
        ? `\n${String(error)}`
        : ''

  appendFileSync(
    join(app.getPath('userData'), 'startup.log'),
    `[${new Date().toISOString()}] ${message}${detail}\n`,
  )
}

process.on('uncaughtException', (error) => {
  logStartup('uncaughtException', error)
  app.quit()
})

process.on('unhandledRejection', (reason) => {
  logStartup('unhandledRejection', reason)
})

// Single instance lock — prevents concurrent SQLite writes
const hasSingleInstanceLock = app.requestSingleInstanceLock()
if (!hasSingleInstanceLock) {
  logStartup('single instance lock unavailable')
  app.quit()
}

let mainWindow: BrowserWindow | null = null
let habitReminderService: HabitReminderService | null = null
let appUpdater: AppUpdater | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    backgroundColor: '#16161e',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  // DevTools only in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools()
  }

  // Load the remote URL for development or the local html file for production
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Window control IPC handlers
ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.on('window:close', () => mainWindow?.close())

if (hasSingleInstanceLock) {
  app.whenReady().then(async () => {
    await getStore()

    // Initialize DB + run migrations
    getDb()

    // Register all IPC handlers
    registerAllHandlers()

    createWindow()
    habitReminderService = new HabitReminderService({
      getMainWindow: () => mainWindow,
    })
    habitReminderService.start()
    appUpdater = new AppUpdater({
      getMainWindow: () => mainWindow,
    })

    if (app.isPackaged) {
      appUpdater.start()
    }

    ipcMain.handle('shell:installUpdate', () => appUpdater?.installUpdate())

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  }).catch((error: unknown) => {
    logStartup('startup failed', error)
    app.quit()
  })
}

app.on('before-quit', () => {
  habitReminderService?.stop()
})

app.on('window-all-closed', () => {
  closeDb()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
