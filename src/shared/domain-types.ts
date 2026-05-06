export type HabitKind = 'boolean' | 'count'
export type TaskPriority = 0 | 1 | 2 | 3
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type ShellModuleId = 'dashboard' | 'habits' | 'planner' | 'expenses' | 'food' | 'settings' | 'tags'
export type TaggableItemType = 'habit' | 'task' | 'expense' | 'food_entry'

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

export interface Food {
  id: string
  name: string
  normalizedName: string
  groupFoodId: string | null
  createdAt: string
  updatedAt: string
}

export interface MealEntry {
  id: string
  foodId: string
  foodName: string
  mealType: MealType
  mealTime: string
  date: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface FoodGroupingSuggestion {
  inputName: string
  inputNormalized: string
  suggestedFood: Food
  score: number
}

export interface FoodFrequencySummary {
  foodId: string
  name: string
  count: number
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

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface TaggedItemSummary {
  itemType: TaggableItemType
  itemId: string
  title: string
  subtitle: string
  date: string | null
}
