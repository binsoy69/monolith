import { StickyNote } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Expense, Category } from '../../shared/domain-types'
import { formatPeso } from '../../shared/format'

function formatDate(dateStr: string): string {
  // Parse YYYY-MM-DD without timezone issues
  const [, month, day] = dateStr.split('-').map(Number)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[month - 1]} ${day}`
}

interface ExpenseRowProps {
  expense: Expense
  category: Category | undefined
  walletName: string
  onContextMenu: (e: React.MouseEvent) => void
  isHighlighted?: boolean
}

export function ExpenseRow({
  expense,
  category,
  walletName,
  onContextMenu,
  isHighlighted = false,
}: ExpenseRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isFlashActive, setIsFlashActive] = useState(false)

  useEffect(() => {
    if (!isHighlighted) {
      return
    }

    rowRef.current?.scrollIntoView?.({ block: 'center' })
    setIsFlashActive(true)
    const timer = window.setTimeout(() => setIsFlashActive(false), 1500)
    return () => window.clearTimeout(timer)
  }, [isHighlighted])

  return (
    <div
      ref={rowRef}
      onContextMenu={onContextMenu}
      style={{
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: '0 var(--space-2)',
        cursor: 'default',
        backgroundColor: isFlashActive
          ? 'var(--color-accent-subtle)'
          : isHovered
            ? 'var(--color-bg-subtle)'
            : 'transparent',
        transition: `background-color var(--duration-fast) ease-out`,
        flexShrink: 0,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Date */}
      <span
        style={{
          width: '48px',
          flexShrink: 0,
          fontSize: 'var(--font-size-small)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {formatDate(expense.date)}
      </span>

      {/* Amount */}
      <span
        style={{
          width: '80px',
          flexShrink: 0,
          fontSize: 'var(--font-size-body)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
        }}
      >
        {formatPeso(expense.amount)}
      </span>

      {/* Category dot + name */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: category?.color ?? 'var(--color-text-muted)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {category?.name ?? 'Unknown'}
        </span>
      </span>

      {/* Wallet name */}
      <span
        style={{
          fontSize: 'var(--font-size-small)',
          color: 'var(--color-text-muted)',
          flexShrink: 0,
          maxWidth: '80px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {walletName}
      </span>

      {/* Notes indicator */}
      {expense.notes ? (
        <StickyNote
          size={14}
          style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}
        />
      ) : (
        <span style={{ width: '14px', flexShrink: 0 }} />
      )}
    </div>
  )
}
