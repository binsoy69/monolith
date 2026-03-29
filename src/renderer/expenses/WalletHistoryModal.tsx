import { useState, useEffect } from 'react'
import type { Wallet, WalletTransaction } from '../../shared/domain-types'
import { formatPeso } from '../../shared/format'

interface WalletHistoryModalProps {
  wallet: Wallet
  onClose: () => void
}

function formatSignedAmount(amount: number): string {
  const prefix = amount > 0 ? '+' : ''
  return prefix + formatPeso(Math.abs(amount))
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[Number(month) - 1]} ${Number(day)}, ${year}`
}

export function WalletHistoryModal({ wallet, onClose }: WalletHistoryModalProps) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.api.expenses.listWalletTransactions(wallet.id)
      .then(txns => {
        setTransactions(txns)
        setLoading(false)
      })
  }, [wallet.id])

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      onClick={handleOverlayClick}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }}
    >
      <div
        style={{
          width: 380,
          maxHeight: '70vh',
          backgroundColor: 'var(--color-bg-overlay)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: 'var(--font-size-heading)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--line-height-tight)',
            }}
          >
            {wallet.name} History
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-secondary)',
            }}
          >
            ×
          </button>
        </div>

        {/* Transaction list */}
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {loading ? (
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body)' }}>
              Loading...
            </span>
          ) : transactions.length === 0 ? (
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body)' }}>
              No transactions yet
            </span>
          ) : (
            transactions.map(tx => (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: 'var(--space-2) 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                  {tx.description && (
                    <span
                      style={{
                        fontSize: 'var(--font-size-body)',
                        color: 'var(--color-text-primary)',
                        lineHeight: 'var(--line-height-tight)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tx.description}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 'var(--font-size-small)',
                      color: 'var(--color-text-muted)',
                      lineHeight: 'var(--line-height-tight)',
                    }}
                  >
                    {formatDate(tx.date)}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 'var(--font-size-body)',
                    fontWeight: 600,
                    color: tx.amount > 0 ? 'var(--color-success, #22c55e)' : 'var(--color-text-secondary)',
                    lineHeight: 'var(--line-height-tight)',
                    whiteSpace: 'nowrap',
                    marginLeft: 'var(--space-2)',
                  }}
                >
                  {formatSignedAmount(tx.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
