import { ipcMain } from 'electron'
import { getDb } from '../db/connection'
import { TagRepository } from '../repositories/TagRepository'

export function registerTagsHandlers(): void {
  const db = getDb()
  const repo = new TagRepository(db)

  ipcMain.handle('tags:list', () => repo.list())
  ipcMain.handle('tags:create', (_, data) => repo.create(data))
  ipcMain.handle('tags:listForItem', (_, data) => repo.listForItem(data.itemType, data.itemId))
  ipcMain.handle('tags:setAssignment', (_, data) => repo.setAssignment(data.tagId, data.itemType, data.itemId, data.assigned))
  ipcMain.handle('tags:getItemsByTag', (_, tagId) => repo.listItemsByTag(tagId))
}
