import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarPopupProps {
  selectedDate: string // YYYY-MM-DD
  onSelect: (date: string) => void
  onClose: () => void
  position?: { x: number; y: number }
  showTaskDots?: boolean
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getTodayStr(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseDateStr(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split('-')
  return {
    year: Number(parts[0]),
    month: Number(parts[1]) - 1, // 0-indexed
    day: Number(parts[2]),
  }
}

export function CalendarPopup({
  selectedDate,
  onSelect,
  onClose,
  position,
  showTaskDots = false,
}: CalendarPopupProps) {
  const parsed = parseDateStr(selectedDate)
  const [viewMonth, setViewMonth] = useState(parsed.month)
  const [viewYear, setViewYear] = useState(parsed.year)
  const [datesWithTasks, setDatesWithTasks] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const todayStr = getTodayStr()

  // Fetch task dots when showTaskDots is true and month/year changes
  useEffect(() => {
    if (!showTaskDots) return
    let cancelled = false
    window.api.planner.getDatesWithTasks({ month: viewMonth + 1, year: viewYear }).then((dates) => {
      if (!cancelled) {
        setDatesWithTasks(new Set(dates))
      }
    })
    return () => { cancelled = true }
  }, [showTaskDots, viewMonth, viewYear])

  // Click-outside detection
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [handleMouseDown])

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  // Build calendar grid
  // First day of the month (0=Sun, 1=Mon ... 6=Sat)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  // Convert to Mon-first (0=Mon ... 6=Sun)
  const firstDayMonFirst = (firstDayOfMonth + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  // Build 6-row grid
  const cells: Array<{ day: number | null; dateStr: string | null }> = []
  for (let i = 0; i < firstDayMonFirst; i++) {
    cells.push({ day: null, dateStr: null })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateStr: toDateStr(viewYear, viewMonth, d) })
  }
  // Fill remaining cells to complete 6 rows (42 cells)
  while (cells.length < 42) {
    cells.push({ day: null, dateStr: null })
  }

  const containerStyle: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: Math.min(position.x, window.innerWidth - 296),
        top: Math.min(position.y, window.innerHeight - 300),
        backgroundColor: 'var(--color-bg-overlay)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        zIndex: 2000,
        width: '280px',
        userSelect: 'none',
      }
    : {
        position: 'absolute',
        top: '36px',
        left: 0,
        backgroundColor: 'var(--color-bg-overlay)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        zIndex: 2000,
        width: '280px',
        userSelect: 'none',
      }

  const navButtonStyle: React.CSSProperties = {
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
    <div ref={containerRef} style={containerStyle}>
      {/* Month navigation header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <button
          style={navButtonStyle}
          onClick={prevMonth}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-bg-subtle)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
          aria-label="Previous month"
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
        </button>
        <span style={{ fontSize: 'var(--font-size-body)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          style={navButtonStyle}
          onClick={nextMonth}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-bg-subtle)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
          aria-label="Next month"
        >
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 'var(--space-1)' }}>
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            style={{
              textAlign: 'center',
              fontSize: 'var(--font-size-small)',
              color: 'var(--color-text-muted)',
              fontWeight: 600,
              padding: '2px 0',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((cell, idx) => {
          if (!cell.day || !cell.dateStr) {
            return <div key={idx} style={{ width: '32px', height: '32px' }} />
          }

          const isSelected = cell.dateStr === selectedDate
          const isToday = cell.dateStr === todayStr
          const hasTasks = showTaskDots && datesWithTasks.has(cell.dateStr)

          const cellStyle: React.CSSProperties = {
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--font-size-body)',
            cursor: 'pointer',
            backgroundColor: isSelected ? 'var(--color-accent)' : 'transparent',
            color: isSelected
              ? 'white'
              : isToday
              ? 'var(--color-accent)'
              : 'var(--color-text-primary)',
            fontWeight: isSelected || isToday ? 600 : 400,
            position: 'relative',
          }

          return (
            <div
              key={idx}
              style={cellStyle}
              onClick={() => onSelect(cell.dateStr!)}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-bg-subtle)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                }
              }}
            >
              <span>{cell.day}</span>
              {hasTasks && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '3px',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? 'white' : 'var(--color-accent)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
