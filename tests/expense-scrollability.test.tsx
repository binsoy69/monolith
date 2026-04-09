import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CategoryManageView } from '../src/renderer/expenses/CategoryManageView'
import { ExpenseDonutChart } from '../src/renderer/expenses/ExpenseDonutChart'
import type { Category } from '../src/shared/domain-types'
import type { ExpenseAnalytics } from '../src/shared/ipc-types'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div />,
}))

const categories: Category[] = Array.from({ length: 18 }, (_, index) => ({
  id: `category-${index + 1}`,
  name: `Category ${index + 1}`,
  color: index % 2 === 0 ? '#f97316' : '#3b82f6',
}))

const analytics: ExpenseAnalytics = {
  month: '2026-03',
  monthLabel: 'March 2026',
  monthTotal: 180000,
  categoryBreakdown: categories.map((category, index) => ({
    categoryId: category.id,
    name: category.name,
    color: category.color,
    amount: 10000,
    percentage: index === categories.length - 1 ? 0.0556 : 0.0555,
  })),
  trend: [],
}

describe('Expense scrollability', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('shows the full donut card instead of clipping it with a forced max height', () => {
    render(<ExpenseDonutChart analytics={analytics} isAnimationActive={false} />)

    const breakdownRegion = screen.getByRole('region', { name: 'Category breakdown' })
    const chartCard = breakdownRegion.parentElement as HTMLElement

    expect(chartCard.style.maxHeight).toBe('')
    expect(chartCard.style.overflow).toBe('')
    expect(screen.getByText('Category 18')).toBeInTheDocument()
  })

  it('lets the manage categories panel render at natural height without clipping', () => {
    render(
      <CategoryManageView
        categories={categories}
        onUpdate={vi.fn()}
        onDelete={vi.fn().mockResolvedValue(true)}
        onCreate={vi.fn()}
      />
    )

    const listRegion = screen.getByRole('region', { name: 'Manage categories list' })
    const panel = listRegion.parentElement as HTMLElement

    expect(panel.style.maxHeight).toBe('')
    expect(panel.style.overflow).toBe('')
    expect(screen.getByText('Category 18')).toBeInTheDocument()
  })
})
