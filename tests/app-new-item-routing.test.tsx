import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/renderer/shell/Sidebar', () => ({
  Sidebar: ({
    onNavigate,
  }: {
    activeModule: string
    onNavigate: (module: 'dashboard' | 'habits' | 'planner' | 'expenses') => void
  }) => (
    <div>
      <button onClick={() => onNavigate('dashboard')}>Go dashboard</button>
      <button onClick={() => onNavigate('habits')}>Go habits</button>
      <button onClick={() => onNavigate('planner')}>Go planner</button>
      <button onClick={() => onNavigate('expenses')}>Go expenses</button>
    </div>
  ),
}))

vi.mock('../src/renderer/shell/KeyboardRouter', () => ({
  KeyboardRouter: ({ onNewItem }: { onNewItem: () => void }) => (
    <button onClick={onNewItem}>Trigger new item</button>
  ),
}))

vi.mock('../src/renderer/habits/HabitsView', () => {
  return {
    HabitsView: ({
      newItemRequestId,
      onNewItemHandled,
    }: {
      newItemRequestId?: number
      onNewItemHandled?: (requestId: number) => void
    }) => {
      React.useEffect(() => {
        if (typeof newItemRequestId === 'number') {
          onNewItemHandled?.(newItemRequestId)
        }
      }, [newItemRequestId, onNewItemHandled])

      return <div>Habits request: {newItemRequestId ?? 'none'}</div>
    },
  }
})

vi.mock('../src/renderer/planner/PlannerView', () => {
  return {
    PlannerView: ({
      newItemRequestId,
      onNewItemHandled,
    }: {
      newItemRequestId?: number
      onNewItemHandled?: (requestId: number) => void
    }) => {
      React.useEffect(() => {
        if (typeof newItemRequestId === 'number') {
          onNewItemHandled?.(newItemRequestId)
        }
      }, [newItemRequestId, onNewItemHandled])

      return <div>Planner request: {newItemRequestId ?? 'none'}</div>
    },
  }
})

vi.mock('../src/renderer/expenses/ExpensesView', () => {
  return {
    ExpensesView: ({
      newItemRequestId,
      onNewItemHandled,
    }: {
      newItemRequestId?: number
      onNewItemHandled?: (requestId: number) => void
    }) => {
      React.useEffect(() => {
        if (typeof newItemRequestId === 'number') {
          onNewItemHandled?.(newItemRequestId)
        }
      }, [newItemRequestId, onNewItemHandled])

      return <div>Expenses request: {newItemRequestId ?? 'none'}</div>
    },
  }
})

vi.mock('../src/renderer/shell/WindowChrome', () => ({
  WindowChrome: () => null,
}))

vi.mock('../src/renderer/shell/ModuleHeader', () => ({
  ModuleHeader: () => null,
}))

vi.mock('../src/renderer/settings/SettingsView', () => ({
  SettingsView: () => <div>Settings</div>,
}))

vi.mock('../src/renderer/shell/UpdateBanner', () => ({
  UpdateBanner: () => null,
}))

vi.mock('../src/renderer/shell/KeyboardShortcutOverlay', () => ({
  KeyboardShortcutOverlay: () => null,
}))

vi.mock('../src/renderer/shell/CommandPalette', () => ({
  CommandPalette: () => null,
}))

vi.mock('../src/renderer/shared/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('../src/renderer/shared/ToastContainer', () => ({
  ToastContainer: () => null,
}))

vi.mock('../src/renderer/dashboard/DashboardView', () => ({
  DashboardView: () => <div>Dashboard</div>,
}))

vi.mock('../src/renderer/tags/TagsView', () => ({
  TagsView: () => <div>Tags</div>,
}))

import App from '../src/renderer/App'

describe('App new item routing', () => {
  beforeEach(() => {
    window.api = {
      shell: {
        onNavigate: vi.fn().mockReturnValue(() => {}),
        onUpdateStatus: vi.fn().mockReturnValue(() => {}),
        installUpdate: vi.fn(),
      },
      search: {
        query: vi.fn().mockResolvedValue([]),
      },
    } as typeof window.api
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('consumes a handled new-item request instead of leaking it across module navigation', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Go habits' }))
    fireEvent.click(screen.getByRole('button', { name: 'Trigger new item' }))

    await waitFor(() => {
      expect(screen.getByText('Habits request: none')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Go expenses' }))
    expect(screen.getByText('Expenses request: none')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Go planner' }))
    expect(screen.getByText('Planner request: none')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Go habits' }))
    expect(screen.getByText('Habits request: none')).toBeInTheDocument()
  })
})
