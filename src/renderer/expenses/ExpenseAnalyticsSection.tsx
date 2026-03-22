import type { ExpenseAnalytics } from '../../shared/ipc-types'
import { formatPeso } from '../../shared/format'
import { ExpenseDonutChart } from './ExpenseDonutChart'
import { ExpenseTrendChart } from './ExpenseTrendChart'

interface ExpenseAnalyticsSectionProps {
  analytics: ExpenseAnalytics | null
  isOpen: boolean
  trendMonths: 3 | 6 | 12
  onToggle: () => void
  onSelectTrendMonths: (months: 3 | 6 | 12) => void
  isAnimationActive?: boolean
}

export function ExpenseAnalyticsSection({
  analytics,
  isOpen,
  trendMonths,
  onToggle,
  onSelectTrendMonths,
  isAnimationActive = true,
}: ExpenseAnalyticsSectionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <button
        onClick={onToggle}
        style={{
          alignSelf: 'flex-start',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 'var(--font-size-small)',
          color: isOpen ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          padding: 0,
        }}
      >
        {isOpen ? 'Hide charts' : 'Show charts'}
      </button>

      {isOpen && (
        <section
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span
                style={{
                  fontSize: 'var(--font-size-small)',
                  color: 'var(--color-text-muted)',
                }}
              >
                Monthly spending
              </span>
              <span
                style={{
                  fontSize: 'var(--font-size-heading)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                {analytics
                  ? `${analytics.monthLabel}: ${formatPeso(analytics.monthTotal)}`
                  : 'Loading charts...'}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                flex: '1 1 240px',
                minWidth: '240px',
                display: 'flex',
              }}
            >
              <ExpenseDonutChart analytics={analytics} isAnimationActive={isAnimationActive} />
            </div>
            <div
              style={{
                flex: '1 1 320px',
                minWidth: '320px',
                display: 'flex',
              }}
            >
              <ExpenseTrendChart
                analytics={analytics}
                trendMonths={trendMonths}
                onSelectTrendMonths={onSelectTrendMonths}
                isAnimationActive={isAnimationActive}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
