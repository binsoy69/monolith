import { autoUpdater } from 'electron-updater'
import type { UpdateStatus } from '../../shared/ipc-types'

interface MainWindowLike {
  webContents: {
    send: (channel: 'shell:update-status', payload: UpdateStatus) => void
  }
}

interface AppUpdaterOptions {
  getMainWindow?: () => MainWindowLike | null
}

export class AppUpdater {
  private readonly getMainWindow: () => MainWindowLike | null

  constructor(options: AppUpdaterOptions = {}) {
    this.getMainWindow = options.getMainWindow ?? (() => null)
    autoUpdater.autoDownload = true

    autoUpdater.on('checking-for-update', () => {
      this.sendStatus({ state: 'checking' })
    })

    autoUpdater.on('update-available', (info: { version: string }) => {
      this.sendStatus({ state: 'available', version: info.version })
    })

    autoUpdater.on('download-progress', (progress: { percent: number }) => {
      this.sendStatus({ state: 'downloading', percent: progress.percent })
    })

    autoUpdater.on('update-not-available', () => {
      this.sendStatus({ state: 'not-available' })
    })

    autoUpdater.on('update-downloaded', (info: { version: string }) => {
      this.sendStatus({ state: 'downloaded', version: info.version })
    })

    autoUpdater.on('error', (error: Error) => {
      this.sendStatus({
        state: 'error',
        message: error.message,
      })
    })
  }

  start(): void {
    void autoUpdater.checkForUpdates()
  }

  installUpdate(): void {
    autoUpdater.quitAndInstall()
  }

  private sendStatus(status: UpdateStatus): void {
    this.getMainWindow()?.webContents.send('shell:update-status', status)
  }
}
