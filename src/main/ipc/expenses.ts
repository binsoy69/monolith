import { ipcMain } from 'electron'
import { getDb } from '../db/connection'
import { ExpenseRepository } from '../repositories/ExpenseRepository'
import { WalletRepository } from '../repositories/WalletRepository'

export function registerExpensesHandlers(): void {
  const db = getDb()
  const expenseRepo = new ExpenseRepository(db)
  const walletRepo = new WalletRepository(db)

  // Seed default categories on first run
  expenseRepo.seedDefaultCategories()

  // Expense handlers
  ipcMain.handle('expenses:listExpenses', (_, filters) => expenseRepo.list(filters))
  ipcMain.handle('expenses:createExpense', (_, data) => expenseRepo.create(data))
  ipcMain.handle('expenses:updateExpense', (_, data) => {
    const { id, ...rest } = data
    expenseRepo.update(id, rest)
  })
  ipcMain.handle('expenses:deleteExpense', (_, id) => expenseRepo.delete(id))
  ipcMain.handle('expenses:getAnalytics', (_, data) => expenseRepo.getAnalytics(data))

  // Category handlers
  ipcMain.handle('expenses:listCategories', () => expenseRepo.listCategories())
  ipcMain.handle('expenses:createCategory', (_, data) => expenseRepo.createCategory(data))
  ipcMain.handle('expenses:updateCategory', (_, data) => {
    const { id, ...rest } = data
    expenseRepo.updateCategory(id, rest)
  })
  ipcMain.handle('expenses:deleteCategory', (_, id) => expenseRepo.deleteCategory(id))

  // Wallet handlers
  ipcMain.handle('expenses:listWallets', () => walletRepo.list())
  ipcMain.handle('expenses:createWallet', (_, data) => walletRepo.create(data))
  ipcMain.handle('expenses:updateWallet', (_, data) => {
    const { id, ...rest } = data
    walletRepo.update(id, rest)
  })
  ipcMain.handle('expenses:adjustWalletBalance', (_, data) =>
    walletRepo.adjustBalance(data.id, data.mode, data.amount)
  )
  ipcMain.handle('expenses:deleteWallet', (_, id) => walletRepo.delete(id))
}
