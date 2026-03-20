import { ChevronLeft, ChevronRight } from 'lucide-react'

function getTodayStr(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-')
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`
}

interface DateNavProps {
  viewDate: string
  onPrev: () => void
  onNext: () => void
  tasksDone: number
  tasksTotal: number
}

export function DateNav({ viewDate, onPrev, onNext, tasksDone, tasksTotal }: DateNavProps) {
  const isToday = viewDate === getTodayStr()

  const buttonStyle = {
    width: '28px',
    height: '28px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
      <button
        style={buttonStyle}
        onClick={onPrev}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-bg-subtle)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
        aria-label="Previous day"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
      </button>

      <span
        style={{
          fontSize: 'var(--font-size-body)',
          fontWeight: 600,
          color: isToday ? 'var(--color-accent)' : 'var(--color-text-primary)',
          lineHeight: 'var(--line-height-tight)',
          whiteSpace: 'nowrap',
        }}
      >
        {isToday ? 'Today' : formatDate(viewDate)}
      </span>

      <button
        style={buttonStyle}
        onClick={onNext}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-bg-subtle)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
        aria-label="Next day"
      >
        <ChevronRight size={18} strokeWidth={1.5} />
      </button>

      <span
        style={{
          fontSize: 'var(--font-size-small)',
          color: 'var(--color-text-secondary)',
          marginLeft: 'var(--space-1)',
          whiteSpace: 'nowrap',
        }}
      >
        {tasksDone}/{tasksTotal} done
      </span>
    </div>
  )
}
