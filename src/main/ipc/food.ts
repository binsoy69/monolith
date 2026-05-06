import { ipcMain } from 'electron'
import { getDb } from '../db/connection'
import { FoodRepository } from '../repositories/FoodRepository'

export function registerFoodHandlers(): void {
  const foodRepo = new FoodRepository(getDb())

  ipcMain.handle('food:listEntries', (_, filters) => foodRepo.listEntries(filters))
  ipcMain.handle('food:createEntry', (_, data) => foodRepo.createEntry(data))
  ipcMain.handle('food:updateEntry', (_, data) => foodRepo.updateEntry(data))
  ipcMain.handle('food:deleteEntry', (_, id) => foodRepo.deleteEntry(id))
  ipcMain.handle('food:suggestFoods', (_, data) => foodRepo.suggestFoods(data))
  ipcMain.handle('food:getGroupingSuggestion', (_, data) => foodRepo.getGroupingSuggestion(data))
  ipcMain.handle('food:suppressGroupingSuggestion', (_, data) =>
    foodRepo.suppressGroupingSuggestion(data)
  )
  ipcMain.handle('food:setFoodGroup', (_, data) => foodRepo.setFoodGroup(data.foodId, data.groupFoodId))
  ipcMain.handle('food:getAnalytics', (_, data) => foodRepo.getAnalytics(data))
}
