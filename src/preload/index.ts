import { contextBridge, ipcRenderer } from 'electron'
import type { API } from '../shared/ipc-types'

const api: API = {
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (s) => ipcRenderer.invoke('settings:set', s)
  }
}

contextBridge.exposeInMainWorld('api', api)
