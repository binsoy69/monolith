import { create } from 'zustand'

export interface Toast {
  id: string
  type: 'error' | 'success'
  message: string
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID()
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))

export { useToastStore }

/**
 * Standalone addToast function for use outside of React components
 * (e.g., in Zustand store action error handlers).
 */
export function addToast(toast: Omit<Toast, 'id'>): void {
  useToastStore.getState().addToast(toast)
}
