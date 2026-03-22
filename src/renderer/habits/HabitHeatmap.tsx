import type { HabitHistoryPoint } from '../../shared/ipc-types'

const CELL_SIZE = 10
const CELL_GAP = 2
const ROWS = 7
const COLUMNS = 13
const GRID_WIDTH = COLUMNS * CELL_SIZE + (COLUMNS - 1) * CELL_GAP
const GRID_HEIGHT = ROWS * CELL_SIZE + (ROWS - 1) * CELL_GAP

const HEATMAP_COLORS = [
  'rgba(99, 102, 241, 0.15)',
  'rgba(99, 102, 241, 0.35)',
  'rgba(99, 102, 241, 0.60)',
  'var(--color-accent)',
]

function padPoints(points: HabitHistoryPoint[]): HabitHistoryPoint[] {
  if (points.length >= 90) {
    return points.slice(-90)
  }

  const padded = [...points]
  while (padded.length < 90) {
    const fallbackDate = padded[0]?.date ?? new Date().toISOString().slice(0, 10)
    padded.unshift({ date: fallbackDate, value: 0, completed: false })
  }

  return padded
}

function getCellFill(value: number, maxValue: number): string {
  if (value <= 0) {
    return 'transparent'
  }

  const ratio = value / Math.max(maxValue, 1)
  if (ratio <= 0.25) return HEATMAP_COLORS[0]
  if (ratio <= 0.5) return HEATMAP_COLORS[1]
  if (ratio <= 0.75) return HEATMAP_COLORS[2]
  return HEATMAP_COLORS[3]
}

function formatMonthLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleString('en-US', { month: 'short' })
}

interface HabitHeatmapProps {
  points: HabitHistoryPoint[]
}

export function HabitHeatmap({ points }: HabitHeatmapProps) {
  const heatmapPoints = padPoints(points)
  const maxValue = Math.max(...heatmapPoints.map((point) => point.value), 1)
  const monthLabels = heatmapPoints.reduce<Array<{ label: string; column: number }>>((labels, point, index) => {
    const previousMonth = heatmapPoints[index - 1]?.date.slice(0, 7)
    if (point.date.slice(0, 7) !== previousMonth) {
      labels.push({
        label: formatMonthLabel(point.date),
        column: Math.floor(index / ROWS),
      })
    }
    return labels
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      <svg
        width={GRID_WIDTH}
        height={GRID_HEIGHT}
        viewBox={`0 0 ${GRID_WIDTH} ${GRID_HEIGHT}`}
        role="img"
        aria-label="Habit completion heatmap"
      >
        {heatmapPoints.map((point, index) => {
          const column = Math.floor(index / ROWS)
          const row = index % ROWS
          const x = column * (CELL_SIZE + CELL_GAP)
          const y = row * (CELL_SIZE + CELL_GAP)
          const label = `${point.date}: ${point.completed ? 'completed' : 'missed'}`

          return (
            <rect
              key={`${point.date}-${index}`}
              x={x}
              y={y}
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={2}
              ry={2}
              fill={getCellFill(point.value, maxValue)}
              stroke={point.value > 0 ? 'none' : 'var(--color-border)'}
              strokeWidth={point.value > 0 ? 0 : 1}
              role="img"
              aria-label={label}
            >
              <title>{label}</title>
            </rect>
          )
        })}
      </svg>

      <div
        style={{
          position: 'relative',
          width: `${GRID_WIDTH}px`,
          height: '14px',
        }}
      >
        {monthLabels.map((month) => (
          <span
            key={`${month.label}-${month.column}`}
            style={{
              position: 'absolute',
              left: `${month.column * (CELL_SIZE + CELL_GAP)}px`,
              top: 0,
              fontSize: 'var(--font-size-small)',
              color: 'var(--color-text-muted)',
            }}
          >
            {month.label}
          </span>
        ))}
      </div>
    </div>
  )
}
