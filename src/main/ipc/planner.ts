import { ipcMain } from 'electron'
import { getDb } from '../db/connection'
import { PlannerRepository } from '../repositories/PlannerRepository'
import { getTodayStr } from '../utils/streaks'
import type { TaskPriority } from '../../shared/domain-types'

export function registerPlannerHandlers(): void {
  const repo = new PlannerRepository(getDb())

  ipcMain.handle('planner:listForDate', (_, date: string) => {
    if (date === getTodayStr()) {
      repo.carryForwardToDate(date)
    }
    return repo.listForDate(date)
  })

  ipcMain.handle('planner:create', (_, data: { title: string; notes?: string; date: string }) =>
    repo.create(data)
  )

  ipcMain.handle(
    'planner:update',
    (_, data: { id: string; title?: string; notes?: string; date?: string; completed?: boolean; priority?: TaskPriority }) => {
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

  ipcMain.handle('planner:getDatesWithTasks', (_, data: { month: number; year: number }) =>
    repo.getDatesWithTasks(data.month, data.year)
  )

  ipcMain.handle('planner:getDatesWithNotes', (_, data: { month: number; year: number }) =>
    repo.getDatesWithNotes(data.month, data.year)
  )
}
