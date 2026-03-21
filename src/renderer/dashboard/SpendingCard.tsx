import { useState } from 'react'
import type { DashboardData } from '../../shared/ipc-types'

interface SpendingCardProps {
  data: DashboardData['spending'] | undefined
  onClick: () => void
}

function formatPeso(amount: number): string {
  // Amounts are stored as integers (centavos)
  // Divide by 100 to get pesos, show whole number if no cents
  const pesos = amount / 100
  if (pesos === Math.floor(pesos)) {
    return `\u20B1${Math.floor(pesos).toLocaleString()}`
  }
  return `\u20B1${pesos.toFixed(2)}`
}

export function SpendingCard({ data, onClick }: SpendingCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const todayTotal = data?.todayTotal ?? 0
  const topCategories = data?.topCategories ?? []
  const isEmpty = todayTotal === 0 && topCategories.length === 0

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div
      className="focus-ring"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? 'var(--color-bg-subtle)' : 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        cursor: 'pointer',
        transition: 'background var(--duration-fast) ease-out',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 'var(--font-size-heading)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          Spending
        </span>
      </div>

      {isEmpty ? (
        /* Empty state */
        <p
          style={{
            margin: 'var(--space-2) 0 0',
            fontSize: 'var(--font-size-body)',
            color: 'var(--color-text-muted)',
          }}
        >
          \u20B10 spent today
        </p>
      ) : (
        <>
          {/* Total headline */}
          <p
            style={{
              margin: 'var(--space-2) 0 var(--space-4)',
              fontSize: 'var(--font-size-display)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--line-height-tight)',
            }}
          >
            {formatPeso(todayTotal)} today
          </p>

          {/* Category list */}
          {topCategories.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {topCategories.map((cat) => (
                <div
                  key={cat.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {cat.color && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: cat.color,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: 'var(--font-size-body)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {cat.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 'var(--font-size-body)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {formatPeso(cat.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
