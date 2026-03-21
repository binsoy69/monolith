import type { Habit, Task, Category, Wallet, Expense } from './domain-types'

export interface AppSettings {
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY'
  notificationTime: string // "HH:mm" format e.g. "09:00"
  windowBounds?: { width: number; height: number; x: number; y: number }
}

export interface SettingsAPI {
  get: () => Promise<AppSettings>
  set: (settings: Partial<AppSettings>) => Promise<void>
}

export interface WindowAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

export interface HabitWithToday extends Habit {
  completedToday: boolean
  currentStreak: number
  bestStreak: number
}

export interface HabitsAPI {
  getToday: (date: string) => Promise<HabitWithToday[]>
  listArchived: () => Promise<Habit[]>
  create: (data: { name: string; daysOfWeek: string }) => Promise<Habit>
  update: (data: { id: string; name?: string; daysOfWeek?: string }) => Promise<void>
  archive: (id: string) => Promise<void>
  complete: (data: { habitId: string; date: string }) => Promise<{ currentStreak: number; bestStreak: number }>
  uncomplete: (data: { habitId: string; date: string }) => Promise<{ currentStreak: number; bestStreak: number }>
}

export interface PlannerAPI {
  listForDate: (date: string) => Promise<Task[]>
  create: (data: { title: string; notes?: string; date: string }) => Promise<Task>
  update: (data: { id: string; title?: string; notes?: string; date?: string; completed?: boolean }) => Promise<void>
  delete: (id: string) => Promise<void>
  reorder: (data: { ids: string[]; date: string }) => Promise<void>
  getNotes: (date: string) => Promise<string>
  saveNotes: (data: { date: string; content: string }) => Promise<void>
  getDatesWithTasks: (data: { month: number; year: number }) => Promise<string[]>
}

export interface ExpensesAPI {
  listExpenses: (filters?: { startDate?: string; endDate?: string; categoryId?: string }) => Promise<Expense[]>
  createExpense: (data: { amount: number; date: string; categoryId: string; walletId: string; notes?: string }) => Promise<string>
  updateExpense: (data: { id: string; amount: number; date: string; categoryId: string; walletId: string; notes?: string }) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  listCategories: () => Promise<Category[]>
  createCategory: (data: { name: string; color: string }) => Promise<Category>
  updateCategory: (data: { id: string; name?: string; color?: string }) => Promise<void>
  deleteCategory: (id: string) => Promise<boolean>
  listWallets: () => Promise<Wallet[]>
  createWallet: (data: { name: string; balance: number }) => Promise<Wallet>
  updateWallet: (data: { id: string; name?: string }) => Promise<void>
  adjustWalletBalance: (data: { id: string; mode: 'set' | 'delta'; amount: number }) => Promise<void>
  deleteWallet: (id: string) => Promise<boolean>
}

export interface DashboardData {
  habits: {
    total: number
    completed: number
    streakHighlights: Array<{ name: string; currentStreak: number }>
  }
  tasks: {
    todayIncomplete: Array<{ id: string; title: string }>
    totalIncomplete: number
    overdueCount: number
  }
  spending: {
    todayTotal: number
    topCategories: Array<{ name: string; color: string; amount: number }>
  }
}

export interface DashboardAPI {
  getToday: (date: string) => Promise<DashboardData>
}

export interface API {
  settings: SettingsAPI
  window: WindowAPI
  habits: HabitsAPI
  planner: PlannerAPI
  expenses: ExpensesAPI
  dashboard: DashboardAPI
}
