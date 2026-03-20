import { ipcMain } from 'electron'
import { getDb } from '../db/connection'
import { PlannerRepository } from '../repositories/PlannerRepository'

export function registerPlannerHandlers(): void {
  const repo = new PlannerRepository(getDb())

  ipcMain.handle('planner:listForDate', (_, date: string) => repo.listForDate(date))

  ipcMain.handle('planner:create', (_, data: { title: string; notes?: string; date: string }) =>
    repo.create(data)
  )

  ipcMain.handle(
    'planner:update',
    (_, data: { id: string; title?: string; notes?: string; date?: string; completed?: boolean }) => {
      const { id, ...rest } = data
      repo.update(id, rest)
    }
  )

  ipcMain.handle('planner:delete', (_, id: string) => repo.delete(id))

  ipcMain.handle('planner:reorder', (_, data: { ids: string[]; date: string }) =>
    repo.reorder(data.ids, data.date)
  )

  ipcMain.handle('planner:getNotes', (_, date: string) => repo.getNotes(date))

  ipcMain.handle('planner:saveNotes', (_, data: { date: string; content: string }) =>
    repo.saveNotes(data.date, data.content)
  )
}
