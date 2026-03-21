import { useState } from 'react'
import type { Category } from '../../shared/domain-types'
import { CalendarPopup } from '../shared/CalendarPopup'

interface ExpenseFilterBarProps {
  filters: { startDate?: string; endDate?: string; categoryId?: string }
  categories: Category[]
  onFiltersChange: (filters: { startDate?: string; endDate?: string; categoryId?: string }) => void
  onClear: () => void
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDisplayDate(dateStr: string): string {
  const parts = dateStr.split('-')
  const month = SHORT_MONTHS[Number(parts[1]) - 1]
  const day = Number(parts[2])
  const year = Number(parts[0])
  return `${month} ${day}, ${year}`
}

export function ExpenseFilterBar({
  filters,
  categories,
  onFiltersChange,
  onClear,
}: ExpenseFilterBarProps) {
  const hasFilters =
    Boolean(filters.startDate) || Boolean(filters.endDate) || Boolean(filters.categoryId)

  const [openPicker, setOpenPicker] = useState<'start' | 'end' | null>(null)

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
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    minWidth: '110px',
    userSelect: 'none',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-small)',
    color: 'var(--color-text-muted)',
    marginRight: '4px',
  }

  // Get a fallback date for the popup when no date is selected
  function getTodayStr(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
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
      {/* From date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
        <span style={labelStyle}>From</span>
        <div
          style={{
            ...inputStyle,
            color: filters.startDate ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          }}
          onClick={() => setOpenPicker(openPicker === 'start' ? null : 'start')}
        >
          {filters.startDate ? formatDisplayDate(filters.startDate) : 'Start date'}
        </div>
        {openPicker === 'start' && (
          <CalendarPopup
            selectedDate={filters.startDate ?? getTodayStr()}
            onSelect={(date) => {
              handleStartDate(date)
              setOpenPicker(null)
            }}
            onClose={() => setOpenPicker(null)}
            showTaskDots={false}
          />
        )}
      </div>

      {/* To date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
        <span style={labelStyle}>To</span>
        <div
          style={{
            ...inputStyle,
            color: filters.endDate ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          }}
          onClick={() => setOpenPicker(openPicker === 'end' ? null : 'end')}
        >
          {filters.endDate ? formatDisplayDate(filters.endDate) : 'End date'}
        </div>
        {openPicker === 'end' && (
          <CalendarPopup
            selectedDate={filters.endDate ?? getTodayStr()}
            onSelect={(date) => {
              handleEndDate(date)
              setOpenPicker(null)
            }}
            onClose={() => setOpenPicker(null)}
            showTaskDots={false}
          />
        )}
      </div>

      {/* Category filter */}
      <select
        value={filters.categoryId ?? ''}
        onChange={(e) => handleCategory(e.target.value)}
        style={{
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
