import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ExpenseAnalytics, ExpenseTrendPoint } from '../../shared/ipc-types'
import { formatPeso } from '../../shared/format'

interface ExpenseTrendChartProps {
  analytics: ExpenseAnalytics | null
  trendMonths: 3 | 6 | 12
  onSelectTrendMonths: (months: 3 | 6 | 12) => void
  isAnimationActive?: boolean
}

function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: ExpenseTrendPoint }>
}) {
  const point = payload?.[0]?.payload

  if (!active || !point) {
    return null
  }

  return (
    <div
      style={{
        background: 'var(--color-bg-overlay)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: 'var(--space-2) var(--space-2)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--font-size-small)',
          color: 'var(--color-text-muted)',
          marginBottom: '2px',
        }}
      >
        {point.month}
      </div>
      <div
        style={{
          fontSize: 'var(--font-size-body)',
          color: 'var(--color-text-primary)',
          fontWeight: 600,
        }}
      >
        {formatPeso(point.total)}
      </div>
    </div>
  )
}

export function ExpenseTrendChart({
  analytics,
  trendMonths,
  onSelectTrendMonths,
  isAnimationActive = true,
}: ExpenseTrendChartProps) {
  const trend = analytics?.trend ?? []
  const isEmpty = trend.length === 0 || trend.every((point) => point.total === 0)

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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: 'var(--font-size-heading)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          Spending trend
        </span>
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          {[3, 6, 12].map((option) => {
            const isActive = trendMonths === option
            return (
              <button
                key={option}
                onClick={() => onSelectTrendMonths(option as 3 | 6 | 12)}
                style={{
                  height: '28px',
                  padding: '0 var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: isActive ? 'var(--color-accent-subtle)' : 'transparent',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-small)',
                  cursor: 'pointer',
                }}
              >
                {option}M
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: '160px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
            />
            <YAxis
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={64}
              tickFormatter={(value) => formatPeso(Number(value))}
            />
            <Tooltip
              content={<TrendTooltip />}
              cursor={{ stroke: 'var(--color-border)', strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--color-accent)"
              fill="rgba(99, 102, 241, 0.18)"
              strokeWidth={2}
              isAnimationActive={isAnimationActive}
            />
          </AreaChart>
        </ResponsiveContainer>

        {isEmpty && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--color-text-muted)',
              }}
            >
              No data yet
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
