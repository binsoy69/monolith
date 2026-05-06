import type { MealEntry } from '../../shared/domain-types'

interface MealJournalListProps {
  entries: MealEntry[]
  highlightEntryId?: string
  onEdit: (entry: MealEntry) => void
  onDelete: (id: string) => void
  onSelectFood: (entry: MealEntry) => void
}

function formatDateTime(entry: MealEntry): string {
  const date = new Date(entry.mealTime)
  if (Number.isNaN(date.getTime())) return `${entry.date} ${entry.mealType}`
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function MealJournalList({
  entries,
  highlightEntryId,
  onEdit,
  onDelete,
  onSelectFood,
}: MealJournalListProps): React.JSX.Element {
  if (entries.length === 0) {
    return (
      <p style={{ margin: 0, padding: 'var(--space-5)', color: 'var(--color-text-secondary)' }}>
        No meals match this view.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {entries.map((entry) => (
        <article
          key={entry.id}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: 'var(--space-3)',
            alignItems: 'center',
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background:
              entry.id === highlightEntryId ? 'var(--color-accent-subtle)' : 'rgba(255,255,255,0.025)',
          }}
        >
          <button
            type="button"
            onClick={() => onSelectFood(entry)}
            style={{
              minWidth: 0,
              border: 'none',
              background: 'none',
              color: 'inherit',
              textAlign: 'left',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'block', fontWeight: 650, color: 'var(--color-text-primary)' }}>
              {entry.foodName}
            </span>
            <span style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-small)' }}>
              {entry.mealType} · {formatDateTime(entry)}
            </span>
            {entry.notes ? (
              <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-small)', marginTop: 2 }}>
                {entry.notes}
              </span>
            ) : null}
          </button>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button type="button" onClick={() => onEdit(entry)}>
              Edit
            </button>
            <button type="button" onClick={() => onDelete(entry.id)}>
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
