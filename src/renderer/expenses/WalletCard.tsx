import { Pencil, ArrowUpDown, Clock } from 'lucide-react'
import type { Wallet } from '../../shared/domain-types'
import { formatPeso } from '../../shared/format'

interface WalletCardProps {
  wallet: Wallet
  onEdit: () => void
  onAdjust: () => void
  onViewHistory: () => void
}

export function WalletCard({ wallet, onEdit, onAdjust, onViewHistory }: WalletCardProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        paddingTop: '12px',
        paddingBottom: '12px',
        paddingLeft: 'var(--space-4)',
        paddingRight: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
      }}
    >
      <span
        style={{
          fontSize: 'var(--font-size-body)',
          fontWeight: 400,
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--line-height-tight)',
        }}
      >
        {wallet.name}
      </span>
      <span
        style={{
          fontSize: 'var(--font-size-body)',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--line-height-tight)',
        }}
      >
        {formatPeso(wallet.balance)}
      </span>
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          marginTop: 'var(--space-1)',
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          title="Edit wallet"
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 'var(--radius-sm)',
            transition: 'color var(--duration-fast) ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-text-primary)'
            e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-secondary)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Pencil size={16} strokeWidth={1.5} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onAdjust() }}
          title="Adjust balance"
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 'var(--radius-sm)',
            transition: 'color var(--duration-fast) ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-text-primary)'
            e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-secondary)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <ArrowUpDown size={16} strokeWidth={1.5} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onViewHistory() }}
          title="View history"
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 'var(--radius-sm)',
            transition: 'color var(--duration-fast) ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-text-primary)'
            e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-secondary)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Clock size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
