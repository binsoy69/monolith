import type {
  Habit,
  HabitHistoryPoint as DomainHabitHistoryPoint,
  HabitKind,
  Task,
  TaskPriority,
  Category,
  Wallet,
  Expense,
  WalletTransaction,
  Tag,
  TaggableItemType,
  TaggedItemSummary,
} from './domain-types'

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
  todayValue: number
}

export interface HabitHistoryPoint extends DomainHabitHistoryPoint {}

export interface HabitsAPI {
  getToday: (date: string) => Promise<HabitWithToday[]>
  listArchived: () => Promise<Habit[]>
  create: (data: { name: string; daysOfWeek: string; kind?: HabitKind; targetCount?: number | null }) => Promise<Habit>
  update: (data: { id: string; name?: string; daysOfWeek?: string; kind?: HabitKind; targetCount?: number | null }) => Promise<void>
  archive: (id: string) => Promise<void>
  complete: (data: { habitId: string; date: string }) => Promise<{ currentStreak: number; bestStreak: number }>
  uncomplete: (data: { habitId: string; date: string }) => Promise<{ currentStreak: number; bestStreak: number }>
  getHistory: (data: { habitId: string; endDate: string; days: number }) => Promise<HabitHistoryPoint[]>
  reorder: (data: { ids: string[] }) => Promise<void>
  incrementCount: (data: { habitId: string; date: string }) => Promise<{ todayValue: number; completedToday: boolean; currentStreak: number; bestStreak: number }>
  setCount: (data: { habitId: string; date: string; value: number }) => Promise<{ todayValue: number; completedToday: boolean; currentStreak: number; bestStreak: number }>
  resetCount: (data: { habitId: string; date: string }) => Promise<{ todayValue: number; completedToday: boolean; currentStreak: number; bestStreak: number }>
}

export interface PlannerAPI {
  listForDate: (date: string) => Promise<Task[]>
  create: (data: { title: string; notes?: string; date: string }) => Promise<Task>
  update: (data: { id: string; title?: string; notes?: string; date?: string; completed?: boolean; priority?: TaskPriority }) => Promise<void>
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
  updateWallet: (data: { id: string; name?: string; balance?: number; description?: string }) => Promise<void>
  adjustWalletBalance: (data: { id: string; mode: 'set' | 'delta'; amount: number; description?: string }) => Promise<void>
  deleteWallet: (id: string) => Promise<boolean>
  listWalletTransactions: (walletId: string) => Promise<WalletTransaction[]>
  getAnalytics: (data: { month: string; trendMonths: 3 | 6 | 12 }) => Promise<ExpenseAnalytics>
}

export interface ExpenseCategoryBreakdownItem {
  categoryId: string
  name: string
  color: string | null
  amount: number
  percentage: number
}

export interface ExpenseTrendPoint {
  month: string
  label: string
  total: number
}

export interface ExpenseAnalytics {
  month: string
  monthLabel: string
  monthTotal: number
  categoryBreakdown: ExpenseCategoryBreakdownItem[]
  trend: ExpenseTrendPoint[]
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

export interface TagsAPI {
  list: () => Promise<Tag[]>
  create: (data: { name: string }) => Promise<Tag>
  listForItem: (data: { itemType: TaggableItemType; itemId: string }) => Promise<Tag[]>
  setAssignment: (data: { tagId: string; itemType: TaggableItemType; itemId: string; assigned: boolean }) => Promise<void>
  getItemsByTag: (tagId: string) => Promise<TaggedItemSummary[]>
}

export interface API {
  settings: SettingsAPI
  window: WindowAPI
  habits: HabitsAPI
  planner: PlannerAPI
  expenses: ExpensesAPI
  dashboard: DashboardAPI
  tags: TagsAPI
}
