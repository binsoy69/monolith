import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { ModuleId } from '../App'
import { HabitsCard } from './HabitsCard'
import { TasksCard } from './TasksCard'
import { SpendingCard } from './SpendingCard'

function getTodayDateStr(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

interface DashboardViewProps {
  onNavigate: (module: ModuleId) => void
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const todayStr = getTodayDateStr()

  const { data, isError } = useQuery({
    queryKey: ['dashboard', todayStr],
    queryFn: () => window.api.dashboard.getToday(todayStr),
    staleTime: 0,
    placeholderData: keepPreviousData,
  })

  const dateHeader = new Date(todayStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  if (isError) {
    return (
      <div
        style={{
          padding: 'var(--space-6)',
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body)' }}>
          Couldn&apos;t load today&apos;s summary. Try restarting the app.
        </span>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: 'var(--space-6)',
        overflow: 'auto',
        flex: 1,
      }}
    >
      <h1
        style={{
          fontSize: 'var(--font-size-display)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: 0,
          marginBottom: 'var(--space-6)',
        }}
      >
        {dateHeader}
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <HabitsCard data={data?.habits} onClick={() => onNavigate('habits')} />
        <TasksCard data={data?.tasks} onClick={() => onNavigate('planner')} />
        <SpendingCard data={data?.spending} onClick={() => onNavigate('expenses')} />
      </div>
    </div>
  )
}
