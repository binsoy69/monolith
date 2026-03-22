import { create } from 'zustand'
import type { Wallet, Category, Expense } from '../../shared/domain-types'
import type { ExpenseAnalytics } from '../../shared/ipc-types'
import { addToast } from '../shared/toast-store'

interface ExpensesStore {
  wallets: Wallet[]
  categories: Category[]
  expenses: Expense[]
  walletsLoaded: boolean
  categoriesLoaded: boolean
  expensesLoaded: boolean
  analytics: ExpenseAnalytics | null
  analyticsLoaded: boolean
  trendMonths: 3 | 6 | 12
  filters: { startDate?: string; endDate?: string; categoryId?: string }

  loadWallets: () => Promise<void>
  loadCategories: () => Promise<void>
  loadExpenses: () => Promise<void>
  loadAnalytics: (month: string, trendMonths: 3 | 6 | 12) => Promise<void>

  createWallet: (data: { name: string; balance: number }) => Promise<void>
  updateWallet: (id: string, data: { name?: string }) => Promise<void>
  adjustWalletBalance: (id: string, mode: 'set' | 'delta', amount: number) => Promise<void>
  deleteWallet: (id: string) => Promise<boolean>

  createExpense: (data: { amount: number; date: string; categoryId: string; walletId: string; notes?: string }) => Promise<void>
  updateExpense: (id: string, data: { amount: number; date: string; categoryId: string; walletId: string; notes?: string }) => Promise<void>
  deleteExpense: (id: string) => Promise<void>

  createCategory: (data: { name: string; color: string }) => Promise<Category | null>
  updateCategory: (id: string, data: { name?: string; color?: string }) => Promise<void>
  deleteCategory: (id: string) => Promise<boolean>

  setFilters: (filters: Partial<ExpensesStore['filters']>) => void
  clearFilters: () => void
  setTrendMonths: (trendMonths: 3 | 6 | 12) => void
}

export const useExpensesStore = create<ExpensesStore>((set, get) => ({
  wallets: [],
  categories: [],
  expenses: [],
  walletsLoaded: false,
  categoriesLoaded: false,
  expensesLoaded: false,
  analytics: null,
  analyticsLoaded: false,
  trendMonths: 6,
  filters: {},

  loadWallets: async () => {
    try {
      const wallets = await window.api.expenses.listWallets()
      set({ wallets, walletsLoaded: true })
    } catch {
      addToast({ type: 'error', message: 'Failed to load wallets.' })
    }
  },

  loadCategories: async () => {
    try {
      const categories = await window.api.expenses.listCategories()
      set({ categories, categoriesLoaded: true })
    } catch {
      addToast({ type: 'error', message: 'Failed to load categories.' })
    }
  },

  loadExpenses: async () => {
    try {
      const filters = get().filters
      const expenses = await window.api.expenses.listExpenses(
        Object.keys(filters).length > 0 ? filters : undefined
      )
      set({ expenses, expensesLoaded: true })
    } catch {
      addToast({ type: 'error', message: 'Failed to load expenses.' })
    }
  },

  loadAnalytics: async (month, trendMonths) => {
    try {
      const analytics = await window.api.expenses.getAnalytics({ month, trendMonths })
      set({ analytics, analyticsLoaded: true })
    } catch {
      addToast({ type: 'error', message: 'Failed to load expense analytics.' })
    }
  },

  createWallet: async (data) => {
    try {
      await window.api.expenses.createWallet(data)
      await get().loadWallets()
    } catch {
      addToast({ type: 'error', message: 'Failed to create wallet. Changes were not applied.' })
    }
  },

  updateWallet: async (id, data) => {
    try {
      await window.api.expenses.updateWallet({ id, ...data })
      await get().loadWallets()
    } catch {
      addToast({ type: 'error', message: 'Failed to update wallet. Changes were not applied.' })
    }
  },

  adjustWalletBalance: async (id, mode, amount) => {
    // Optimistic update
    const prev = get().wallets
    set((state) => ({
      wallets: state.wallets.map((w) => {
        if (w.id !== id) return w
        const newBalance = mode === 'set' ? amount : w.balance + amount
        return { ...w, balance: newBalance }
      }),
    }))
    try {
      await window.api.expenses.adjustWalletBalance({ id, mode, amount })
    } catch {
      // Rollback on error
      set({ wallets: prev })
      addToast({ type: 'error', message: 'Failed to adjust balance. Changes were not applied.' })
    }
  },

  deleteWallet: async (id) => {
    try {
      const success = await window.api.expenses.deleteWallet(id)
      if (!success) {
        addToast({ type: 'error', message: "Can't delete — this wallet has expenses" })
        return false
      }
      await get().loadWallets()
      return true
    } catch {
      addToast({ type: 'error', message: 'Failed to delete wallet. Changes were not applied.' })
      return false
    }
  },

  createExpense: async (data) => {
    // Optimistic: add expense to list + deduct from wallet balance
    const prevExpenses = get().expenses
    const prevWallets = get().wallets
    const tempId = crypto.randomUUID()
    const optimisticExpense: Expense = {
      id: tempId,
      amount: data.amount,
      date: data.date,
      categoryId: data.categoryId,
      walletId: data.walletId,
      notes: data.notes ?? null,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({
      expenses: [optimisticExpense, ...state.expenses],
      wallets: state.wallets.map((w) =>
        w.id === data.walletId ? { ...w, balance: w.balance - data.amount } : w
      ),
    }))
    try {
      const realId = await window.api.expenses.createExpense(data)
      // Replace temp entry with real ID
      set((state) => ({
        expenses: state.expenses.map((e) =>
          e.id === tempId ? { ...e, id: realId } : e
        ),
      }))
    } catch {
      set({ expenses: prevExpenses, wallets: prevWallets })
      addToast({ type: 'error', message: 'Failed to save expense. Changes were not applied.' })
    }
  },

  updateExpense: async (id, data) => {
    const prevExpenses = get().expenses
    const prevWallets = get().wallets
    const oldExpense = get().expenses.find((e) => e.id === id)
    if (!oldExpense) return

    // Optimistic: update expense, reverse old deduction, apply new
    set((state) => ({
      expenses: state.expenses.map((e) => e.id === id ? { ...e, ...data, walletId: data.walletId } : e),
      wallets: state.wallets.map((w) => {
        let balance = w.balance
        // Reverse old deduction if this wallet was the old one
        if (oldExpense.walletId && w.id === oldExpense.walletId) balance += oldExpense.amount
        // Apply new deduction
        if (w.id === data.walletId) balance -= data.amount
        return { ...w, balance }
      }),
    }))
    try {
      await window.api.expenses.updateExpense({ id, ...data })
    } catch {
      set({ expenses: prevExpenses, wallets: prevWallets })
      addToast({ type: 'error', message: 'Failed to save expense. Changes were not applied.' })
    }
  },

  deleteExpense: async (id) => {
    const prevExpenses = get().expenses
    const prevWallets = get().wallets
    const expense = get().expenses.find((e) => e.id === id)
    if (!expense) return

    // Optimistic: remove expense + reverse wallet deduction
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
      wallets: state.wallets.map((w) =>
        w.id === expense.walletId ? { ...w, balance: w.balance + expense.amount } : w
      ),
    }))
    try {
      await window.api.expenses.deleteExpense(id)
    } catch {
      set({ expenses: prevExpenses, wallets: prevWallets })
      addToast({ type: 'error', message: 'Failed to delete expense. Changes were not applied.' })
    }
  },

  createCategory: async (data) => {
    try {
      const category = await window.api.expenses.createCategory(data)
      await get().loadCategories()
      return category
    } catch {
      addToast({ type: 'error', message: 'Failed to create category. Changes were not applied.' })
      return null
    }
  },

  updateCategory: async (id, data) => {
    try {
      await window.api.expenses.updateCategory({ id, ...data })
      await get().loadCategories()
    } catch {
      addToast({ type: 'error', message: 'Failed to update category. Changes were not applied.' })
    }
  },

  deleteCategory: async (id) => {
    try {
      const success = await window.api.expenses.deleteCategory(id)
      if (!success) {
        addToast({ type: 'error', message: "Can't delete -- this category is in use" })
        return false
      }
      await get().loadCategories()
      return true
    } catch {
      addToast({ type: 'error', message: 'Failed to delete category. Changes were not applied.' })
      return false
    }
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }))
  },

  clearFilters: () => {
    set({ filters: {} })
  },

  setTrendMonths: (trendMonths) => {
    set({ trendMonths })
  },
}))

export function getTotalBalance(wallets: Wallet[]): number {
  return wallets.reduce((sum, w) => sum + w.balance, 0)
}
