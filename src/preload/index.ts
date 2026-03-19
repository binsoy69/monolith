import { contextBridge, ipcRenderer } from 'electron'
import type { API } from '../shared/ipc-types'

const api: API = {
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (s) => ipcRenderer.invoke('settings:set', s)
  },
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
  }
}

contextBridge.exposeInMainWorld('api', api)
