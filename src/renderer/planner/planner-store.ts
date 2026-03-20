import { create } from 'zustand'
import type { Task } from '../../shared/domain-types'
import { addToast } from '../shared/toast-store'

function getTodayStr(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(dateStr: string, days: number): string {
  const parts = dateStr.split('-')
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  d.setDate(d.getDate() + days)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface PlannerStore {
  tasks: Task[]
  isLoaded: boolean
  viewDate: string
  activeTab: 'tasks' | 'notes'
  notesContent: string
  loadTasks: (date: string) => Promise<void>
  createTask: (title: string, date: string) => Promise<void>
  toggleComplete: (id: string) => Promise<void>
  setViewDate: (date: string) => void
  navigateDay: (direction: -1 | 1) => void
  goToToday: () => void
  setActiveTab: (tab: 'tasks' | 'notes') => void
  loadNotes: (date: string) => Promise<void>
}

export const usePlannerStore = create<PlannerStore>((set, get) => ({
  tasks: [],
  isLoaded: false,
  viewDate: getTodayStr(),
  activeTab: 'tasks',
  notesContent: '',

  loadTasks: async (date: string) => {
    const tasks = await window.api.planner.listForDate(date)
    set({ tasks, isLoaded: true })
  },

  createTask: async (title: string, date: string) => {
    const tempId = `temp-${crypto.randomUUID()}`
    const now = new Date().toISOString()
    const optimisticTask: Task = {
      id: tempId,
      title,
      notes: null,
      date,
      completed: false,
      position: get().tasks.filter((t) => !t.completed).length,
      createdAt: now,
    }

    set((state) => ({ tasks: [...state.tasks, optimisticTask] }))

    try {
      const realTask = await window.api.planner.create({ title, date })
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === tempId ? realTask : t)),
      }))
    } catch {
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== tempId),
      }))
      addToast({ type: 'error', message: 'Failed to save changes. Try again.' })
    }
  },

  toggleComplete: async (id: string) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const wasCompleted = task.completed

    set({
      tasks: tasks.map((t) =>
        t.id === id ? { ...t, completed: !wasCompleted } : t
      ),
    })

    try {
      await window.api.planner.update({ id, completed: !wasCompleted })
    } catch {
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, completed: wasCompleted } : t
        ),
      }))
      addToast({ type: 'error', message: 'Failed to save changes. Try again.' })
    }
  },

  setViewDate: (date: string) => {
    set({ viewDate: date, isLoaded: false })
    get().loadTasks(date)
  },

  navigateDay: (direction: -1 | 1) => {
    const { viewDate } = get()
    const newDate = addDays(viewDate, direction)
    set({ viewDate: newDate, isLoaded: false })
    get().loadTasks(newDate)
  },

  goToToday: () => {
    const today = getTodayStr()
    set({ viewDate: today, isLoaded: false })
    get().loadTasks(today)
  },

  setActiveTab: (tab: 'tasks' | 'notes') => {
    set({ activeTab: tab })
  },

  loadNotes: async (date: string) => {
    const content = await window.api.planner.getNotes(date)
    set({ notesContent: content })
  },
}))
