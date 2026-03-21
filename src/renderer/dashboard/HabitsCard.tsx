import { useState } from 'react'
import type { DashboardData } from '../../shared/ipc-types'

interface HabitsCardProps {
  data: DashboardData['habits'] | undefined
  onClick: () => void
}

export function HabitsCard({ data, onClick }: HabitsCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const total = data?.total ?? 0
  const completed = data?.completed ?? 0
  const streakHighlights = data?.streakHighlights ?? []
  const percentage = total > 0 ? (completed / total) * 100 : 0

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
          Habits
        </span>
        {total > 0 && (
          <span
            style={{
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {completed}/{total} done
          </span>
        )}
      </div>

      {total === 0 ? (
        /* Empty state */
        <p
          style={{
            margin: 'var(--space-2) 0 0',
            fontSize: 'var(--font-size-body)',
            color: 'var(--color-text-muted)',
          }}
        >
          No habits scheduled today
        </p>
      ) : (
        <>
          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: '4px',
              background: 'var(--color-bg-subtle)',
              borderRadius: '2px',
              marginTop: 'var(--space-2)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                background: 'var(--color-accent)',
                height: '100%',
                borderRadius: '2px',
                transition: 'width var(--duration-normal) ease-out',
              }}
            />
          </div>

          {/* Streak highlights */}
          {streakHighlights.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {streakHighlights.slice(0, 2).map((h) => (
                <div
                  key={h.name}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span
                    style={{
                      fontSize: 'var(--font-size-body)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {h.name}
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--font-size-body)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    {h.currentStreak} day streak
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
