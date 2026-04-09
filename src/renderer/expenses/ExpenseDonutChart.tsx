import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { ExpenseAnalytics } from '../../shared/ipc-types'
import { formatPeso } from '../../shared/format'

const FALLBACK_COLORS = ['#4ade80', '#38bdf8', '#fb923c', '#a78bfa', '#f472b6', '#94a3b8']

interface ExpenseDonutChartProps {
  analytics: ExpenseAnalytics | null
  isAnimationActive?: boolean
}

export function ExpenseDonutChart({
  analytics,
  isAnimationActive = true,
}: ExpenseDonutChartProps) {
  const breakdown = analytics?.categoryBreakdown ?? []
  const hasExpenses = (analytics?.monthTotal ?? 0) > 0
  const chartData = hasExpenses
    ? breakdown
    : [{ name: 'Empty', amount: 1, color: 'var(--color-border)' }]

  return (
    <div
      style={{
        flex: 1,
        minHeight: '220px',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-bg-base)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <div style={{ position: 'relative', height: '160px', flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="name"
              innerRadius={50}
              outerRadius={70}
              stroke="none"
              isAnimationActive={isAnimationActive}
            >
              {chartData.map((item, index) => (
                <Cell
                  key={`${item.name}-${index}`}
                  fill={item.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            pointerEvents: 'none',
            textAlign: 'center',
            padding: '0 var(--space-4)',
          }}
        >
          <span
            style={{
              fontSize: 'var(--font-size-display)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            {hasExpenses ? formatPeso(analytics?.monthTotal ?? 0) : 'No expenses'}
          </span>
          <span
            style={{
              fontSize: 'var(--font-size-small)',
              color: 'var(--color-text-muted)',
            }}
          >
            {hasExpenses ? analytics?.monthLabel : 'This month'}
          </span>
        </div>
      </div>

      {hasExpenses ? (
        <div
          aria-label="Category breakdown"
          role="region"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          {breakdown.map((item, index) => (
            <div
              key={item.categoryId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-2)',
                minWidth: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: item.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 'var(--font-size-small)',
                    color: 'var(--color-text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: 'var(--font-size-small)',
                  color: 'var(--color-text-primary)',
                  flexShrink: 0,
                }}
              >
                {formatPeso(item.amount)} · {Math.round(item.percentage * 100)}%
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
