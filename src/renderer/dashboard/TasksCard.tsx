import { useState } from 'react'
import type { DashboardData } from '../../shared/ipc-types'

interface TasksCardProps {
  data: DashboardData['tasks'] | undefined
  onClick: () => void
}

export function TasksCard({ data, onClick }: TasksCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const todayIncomplete = data?.todayIncomplete ?? []
  const totalIncomplete = data?.totalIncomplete ?? 0
  const overdueCount = data?.overdueCount ?? 0

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
          Tasks
        </span>
        {overdueCount > 0 && (
          <span
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--color-warning)',
              fontSize: 'var(--font-size-small)',
              fontWeight: 600,
              padding: 'var(--space-1) var(--space-2)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {overdueCount} overdue
          </span>
        )}
      </div>

      {totalIncomplete === 0 ? (
        /* Empty state */
        <p
          style={{
            margin: 'var(--space-2) 0 0',
            fontSize: 'var(--font-size-body)',
            color: 'var(--color-text-muted)',
          }}
        >
          No tasks for today
        </p>
      ) : (
        <>
          {/* Task list */}
          <div style={{ marginTop: 'var(--space-2)' }}>
            {todayIncomplete.map((task) => (
              <div
                key={task.id}
                style={{
                  paddingTop: 'var(--space-1)',
                  paddingBottom: 'var(--space-1)',
                  fontSize: 'var(--font-size-body)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {task.title}
              </div>
            ))}
          </div>

          {/* Remaining count */}
          {totalIncomplete > todayIncomplete.length && (
            <p
              style={{
                margin: 'var(--space-1) 0 0',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text-muted)',
              }}
            >
              {totalIncomplete} remaining
            </p>
          )}
        </>
      )}
    </div>
  )
}
