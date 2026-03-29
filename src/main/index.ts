import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { getDb, closeDb } from './db/connection'
import { registerAllHandlers } from './ipc/index'

// Single instance lock — prevents concurrent SQLite writes
if (!app.requestSingleInstanceLock()) {
  app.quit()
}

let mainWindow: BrowserWindow | null = null

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

app.whenReady().then(() => {
  // Initialize DB + run migrations
  getDb()

  // Register all IPC handlers
  registerAllHandlers()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  closeDb()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
