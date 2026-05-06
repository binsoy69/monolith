import type { FoodAnalytics } from '../../shared/ipc-types'

interface FoodAnalyticsSectionProps {
  analytics: FoodAnalytics | null
  period: 'week' | 'month'
  onSelectPeriod: (period: 'week' | 'month') => void
}

export function FoodAnalyticsSection({
  analytics,
  period,
  onSelectPeriod,
}: FoodAnalyticsSectionProps): React.JSX.Element {
  const topFood = analytics?.mostEatenFoods[0]

  return (
    <section
      aria-label="Food analytics"
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        background: 'rgba(255,255,255,0.025)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-small)', textTransform: 'uppercase' }}>
            Most eaten
          </div>
          <div style={{ fontSize: 'var(--font-size-heading)', fontWeight: 650 }}>
            {topFood ? `${topFood.name} · ${topFood.count}` : 'No meals yet'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          {(['week', 'month'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSelectPeriod(item)}
              aria-pressed={period === item}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                background: period === item ? 'var(--color-accent-subtle)' : 'transparent',
                color: period === item ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                padding: 'var(--space-1) var(--space-2)',
                textTransform: 'capitalize',
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--space-2)' }}>
        {(analytics?.mostEatenFoods ?? []).slice(0, 3).map((food) => (
          <div key={food.foodId} style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {food.name}
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-small)' }}>
              {food.count} meals
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
