export type HabitKind = 'boolean' | 'count'
export type TaskPriority = 0 | 1 | 2 | 3

export interface Habit {
  id: string
  name: string
  daysOfWeek: string // '1111111' = every day, '1000010' = Mon+Sat
  archived: boolean
  createdAt: string
  kind: HabitKind
  targetCount: number | null
}

export interface HabitHistoryPoint {
  date: string
  value: number
  completed: boolean
}

export interface Task {
  id: string
  title: string
  notes: string | null
  date: string // ISO date YYYY-MM-DD
  completed: boolean
  position: number
  createdAt: string
  priority: TaskPriority
  carriedFromDate: string | null
}

export interface Category {
  id: string
  name: string
  color: string | null
}

export interface Wallet {
  id: string
  name: string
  balance: number // stored as integer cents
}

export interface Expense {
  id: string
  amount: number // stored as integer cents
  date: string // ISO date YYYY-MM-DD
  categoryId: string
  walletId: string | null
  notes: string | null
  createdAt: string
}

export type WalletTransactionType = 'manual_set' | 'manual_delta' | 'expense_deduction' | 'expense_reversal'

export interface WalletTransaction {
  id: string
  walletId: string
  amount: number      // signed integer cents - positive = credit, negative = debit
  type: WalletTransactionType
  description: string | null
  date: string        // ISO date YYYY-MM-DD
  createdAt: string
}
