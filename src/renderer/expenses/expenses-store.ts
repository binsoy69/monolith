import { create } from 'zustand'
import type { Wallet, Category, Expense } from '../../shared/domain-types'
import { addToast } from '../shared/toast-store'

interface ExpensesStore {
  wallets: Wallet[]
  categories: Category[]
  expenses: Expense[]
  walletsLoaded: boolean
  categoriesLoaded: boolean
  expensesLoaded: boolean
  filters: { startDate?: string; endDate?: string; categoryId?: string }

  loadWallets: () => Promise<void>
  loadCategories: () => Promise<void>
  loadExpenses: () => Promise<void>

  createWallet: (data: { name: string; balance: number }) => Promise<void>
  updateWallet: (id: string, data: { name?: string }) => Promise<void>
  adjustWalletBalance: (id: string, mode: 'set' | 'delta', amount: number) => Promise<void>
  deleteWallet: (id: string) => Promise<boolean>

  setFilters: (filters: Partial<ExpensesStore['filters']>) => void
  clearFilters: () => void
}

export const useExpensesStore = create<ExpensesStore>((set, get) => ({
  wallets: [],
  categories: [],
  expenses: [],
  walletsLoaded: false,
  categoriesLoaded: false,
  expensesLoaded: false,
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

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }))
  },

  clearFilters: () => {
    set({ filters: {} })
  },
}))

export function getTotalBalance(wallets: Wallet[]): number {
  return wallets.reduce((sum, w) => sum + w.balance, 0)
}
