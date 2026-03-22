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
  },
  habits: {
    getToday: (date) => ipcRenderer.invoke('habits:getToday', date),
    listArchived: () => ipcRenderer.invoke('habits:listArchived'),
    create: (data) => ipcRenderer.invoke('habits:create', data),
    update: (data) => ipcRenderer.invoke('habits:update', data),
    archive: (id) => ipcRenderer.invoke('habits:archive', id),
    complete: (data) => ipcRenderer.invoke('habits:complete', data),
    uncomplete: (data) => ipcRenderer.invoke('habits:uncomplete', data),
    getHistory: (data) => ipcRenderer.invoke('habits:getHistory', data),
    reorder: (data) => ipcRenderer.invoke('habits:reorder', data),
    incrementCount: (data) => ipcRenderer.invoke('habits:incrementCount', data),
    resetCount: (data) => ipcRenderer.invoke('habits:resetCount', data),
  },
  planner: {
    listForDate: (date) => ipcRenderer.invoke('planner:listForDate', date),
    create: (data) => ipcRenderer.invoke('planner:create', data),
    update: (data) => ipcRenderer.invoke('planner:update', data),
    delete: (id) => ipcRenderer.invoke('planner:delete', id),
    reorder: (data) => ipcRenderer.invoke('planner:reorder', data),
    getNotes: (date) => ipcRenderer.invoke('planner:getNotes', date),
    saveNotes: (data) => ipcRenderer.invoke('planner:saveNotes', data),
    getDatesWithTasks: (data) => ipcRenderer.invoke('planner:getDatesWithTasks', data),
  },
  expenses: {
    listExpenses: (filters) => ipcRenderer.invoke('expenses:listExpenses', filters),
    createExpense: (data) => ipcRenderer.invoke('expenses:createExpense', data),
    updateExpense: (data) => ipcRenderer.invoke('expenses:updateExpense', data),
    deleteExpense: (id) => ipcRenderer.invoke('expenses:deleteExpense', id),
    listCategories: () => ipcRenderer.invoke('expenses:listCategories'),
    createCategory: (data) => ipcRenderer.invoke('expenses:createCategory', data),
    updateCategory: (data) => ipcRenderer.invoke('expenses:updateCategory', data),
    deleteCategory: (id) => ipcRenderer.invoke('expenses:deleteCategory', id),
    listWallets: () => ipcRenderer.invoke('expenses:listWallets'),
    createWallet: (data) => ipcRenderer.invoke('expenses:createWallet', data),
    updateWallet: (data) => ipcRenderer.invoke('expenses:updateWallet', data),
    adjustWalletBalance: (data) => ipcRenderer.invoke('expenses:adjustWalletBalance', data),
    deleteWallet: (id) => ipcRenderer.invoke('expenses:deleteWallet', id),
  },
  dashboard: {
    getToday: (date) => ipcRenderer.invoke('dashboard:getToday', date),
  }
}

contextBridge.exposeInMainWorld('api', api)
