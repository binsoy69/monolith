import type { Category } from '../../shared/domain-types'

interface ExpenseFilterBarProps {
  filters: { startDate?: string; endDate?: string; categoryId?: string }
  categories: Category[]
  onFiltersChange: (filters: { startDate?: string; endDate?: string; categoryId?: string }) => void
  onClear: () => void
}

export function ExpenseFilterBar({
  filters,
  categories,
  onFiltersChange,
  onClear,
}: ExpenseFilterBarProps) {
  const hasFilters =
    Boolean(filters.startDate) || Boolean(filters.endDate) || Boolean(filters.categoryId)

  function handleStartDate(val: string) {
    onFiltersChange({ ...filters, startDate: val || undefined })
  }

  function handleEndDate(val: string) {
    onFiltersChange({ ...filters, endDate: val || undefined })
  }

  function handleCategory(val: string) {
    onFiltersChange({ ...filters, categoryId: val || undefined })
  }

  const inputStyle: React.CSSProperties = {
    height: '28px',
    padding: '0 var(--space-2)',
    background: 'var(--color-bg-base)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--font-size-small)',
    outline: 'none',
    colorScheme: 'dark',
    cursor: 'pointer',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-small)',
    color: 'var(--color-text-muted)',
    marginRight: '4px',
  }

  return (
    <div
      style={{
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: '0 var(--space-4)',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}
    >
      {/* Date range */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={labelStyle}>From</span>
        <input
          type="date"
          value={filters.startDate ?? ''}
          onChange={(e) => handleStartDate(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={labelStyle}>To</span>
        <input
          type="date"
          value={filters.endDate ?? ''}
          onChange={(e) => handleEndDate(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Category filter */}
      <select
        value={filters.categoryId ?? ''}
        onChange={(e) => handleCategory(e.target.value)}
        style={{
          ...inputStyle,
          minWidth: '120px',
        }}
      >
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Clear filters button */}
      {hasFilters && (
        <button
          onClick={onClear}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-text-secondary)',
            padding: '0 var(--space-2)',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
