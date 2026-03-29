import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ExpenseAnalyticsSection } from '../src/renderer/expenses/ExpenseAnalyticsSection'
import type { ExpenseAnalytics } from '../src/shared/ipc-types'

vi.mock('../src/renderer/expenses/ExpenseDonutChart', () => ({
  ExpenseDonutChart: () => <div>Donut chart mock</div>,
}))

vi.mock('../src/renderer/expenses/ExpenseTrendChart', () => ({
  ExpenseTrendChart: () => <div>Trend chart mock</div>,
}))

const analytics: ExpenseAnalytics = {
  month: '2026-03',
  monthLabel: 'March 2026',
  monthTotal: 30100,
  categoryBreakdown: [
    { categoryId: 'food', name: 'Food', color: '#f97316', amount: 20100, percentage: 0.6678 },
  ],
  trend: [
    { month: '2026-01', label: 'Jan', total: 10000 },
    { month: '2026-02', label: 'Feb', total: 15000 },
    { month: '2026-03', label: 'Mar', total: 30100 },
  ],
}

describe('ExpenseAnalyticsSection', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('shows a discoverable collapsed analytics summary with preview copy', () => {
    render(
      <ExpenseAnalyticsSection
        analytics={analytics}
        isOpen={false}
        trendMonths={3}
        onToggle={() => {}}
        onSelectTrendMonths={() => {}}
        isAnimationActive={false}
      />
    )

    const toggle = screen.getByRole('button', { name: /monthly analytics/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Monthly analytics')).toBeInTheDocument()
    expect(screen.getByText('March 2026: ₱301')).toBeInTheDocument()
    expect(screen.getByText('View category breakdown and trend charts')).toBeInTheDocument()
  })

  it('shows visible placeholder copy before analytics data is available', () => {
    render(
      <ExpenseAnalyticsSection
        analytics={null}
        isOpen={false}
        trendMonths={3}
        onToggle={() => {}}
        onSelectTrendMonths={() => {}}
        isAnimationActive={false}
      />
    )

    expect(screen.getByText('This month: Loading total...')).toBeInTheDocument()
    expect(screen.getByText('Monthly totals and charts will appear here')).toBeInTheDocument()
  })

  it('expands inline and reveals the existing chart section', () => {
    const onToggle = vi.fn()

    const { rerender } = render(
      <ExpenseAnalyticsSection
        analytics={analytics}
        isOpen={false}
        trendMonths={3}
        onToggle={onToggle}
        onSelectTrendMonths={() => {}}
        isAnimationActive={false}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /monthly analytics/i }))
    expect(onToggle).toHaveBeenCalledTimes(1)

    rerender(
      <ExpenseAnalyticsSection
        analytics={analytics}
        isOpen={true}
        trendMonths={3}
        onToggle={onToggle}
        onSelectTrendMonths={() => {}}
        isAnimationActive={false}
      />
    )

    expect(screen.getByRole('button', { name: /monthly analytics/i })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Monthly spending')).toBeInTheDocument()
    expect(screen.getByText('Donut chart mock')).toBeInTheDocument()
    expect(screen.getByText('Trend chart mock')).toBeInTheDocument()
  })
})
