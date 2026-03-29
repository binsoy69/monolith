import { ipcMain } from 'electron'
import { getDb } from '../db/connection'
import { SearchRepository } from '../repositories/SearchRepository'

export function registerSearchHandlers(): void {
  const repo = new SearchRepository(getDb())

  ipcMain.handle('search:query', (_, data) => repo.query(data.query, data.limit ?? 8))
}
