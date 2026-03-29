import { useState } from 'react'
import type { Wallet } from '../../shared/domain-types'
import { formatPeso } from '../../shared/format'
import { WalletCard } from './WalletCard'

interface WalletPanelProps {
  wallets: Wallet[]
  onCreateWallet: (data: { name: string; balance: number }) => Promise<void>
  onUpdateWallet: (id: string, data: { name?: string; balance?: number; description?: string }) => Promise<void>
  onAdjustBalance: (wallet: Wallet) => void
  onViewHistory: (walletId: string) => void
}

export function WalletPanel({
  wallets,
  onCreateWallet,
  onUpdateWallet,
  onAdjustBalance,
  onViewHistory,
}: WalletPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newBalance, setNewBalance] = useState('')

  // Inline edit state
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editBalance, setEditBalance] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)

  function handleAddWallet() {
    const balance = parseFloat(newBalance) || 0
    const balanceCents = Math.round(balance * 100)
    if (!newName.trim()) return
    onCreateWallet({ name: newName.trim(), balance: balanceCents }).then(() => {
      setShowAddForm(false)
      setNewName('')
      setNewBalance('')
    })
  }

  function handleCancelAdd() {
    setShowAddForm(false)
    setNewName('')
    setNewBalance('')
  }

  function handleEditSave() {
    if (!editingWalletId) return
    const wallet = wallets.find(w => w.id === editingWalletId)
    if (!wallet) return
    const trimmedName = editName.trim()
    if (!trimmedName) return

    const newBalanceCents = Math.round(parseFloat(editBalance) * 100)
    const balanceChanged = !isNaN(newBalanceCents) && newBalanceCents !== wallet.balance

    // Per D-03: description required if balance changed
    if (balanceChanged && !editDescription.trim()) return

    const updateData: { name?: string; balance?: number; description?: string } = {}
    if (trimmedName !== wallet.name) updateData.name = trimmedName
    if (balanceChanged) {
      updateData.balance = newBalanceCents
      updateData.description = editDescription.trim()
    }

    if (Object.keys(updateData).length === 0) {
      setEditingWalletId(null)
      return
    }

    onUpdateWallet(editingWalletId, updateData).then(() => {
      setEditingWalletId(null)
    })
  }

  return (
    <div
      style={{
        width: 200,
        flexShrink: 0,
        height: '100%',
        borderRight: '1px solid var(--color-border)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <span
          style={{
            fontSize: 'var(--font-size-small)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--line-height-tight)',
          }}
        >
          Wallets
        </span>
        <span
          style={{
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-text-muted)',
            lineHeight: 'var(--line-height-tight)',
          }}
        >
          Total Balance
        </span>
        <span
          style={{
            fontSize: 'var(--font-size-heading)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--line-height-tight)',
          }}
        >
          {formatPeso(totalBalance)}
        </span>
      </div>

      {/* Wallet list or empty state */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        {/* Add wallet form — at top of scrollable area */}
        {showAddForm && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Wallet name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddWallet()
                if (e.key === 'Escape') handleCancelAdd()
              }}
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px var(--space-2)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-small)',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-focused)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)' }}>
                ₱
              </span>
              <input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder="Initial balance"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddWallet()
                  if (e.key === 'Escape') handleCancelAdd()
                }}
                style={{
                  flex: 1,
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px var(--space-2)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-small)',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-focused)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                onClick={handleCancelAdd}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px 0',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-small)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddWallet}
                style={{
                  background: 'var(--color-accent)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px var(--space-2)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-small)',
                  color: '#fff',
                  fontWeight: 600,
                }}
              >
                Save
              </button>
            </div>
          </div>
        )}

        {wallets.length === 0 && !showAddForm ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              alignItems: 'flex-start',
            }}
          >
            <span
              style={{
                fontSize: 'var(--font-size-body)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              Create a wallet first
            </span>
            <span
              style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-normal)',
              }}
            >
              Expenses require a wallet. Add your first wallet to get started.
            </span>
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px var(--space-2)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-small)',
                color: 'var(--color-accent)',
              }}
            >
              Add Wallet
            </button>
          </div>
        ) : (
          wallets.map((wallet) => {
            if (editingWalletId === wallet.id) {
              const newBalanceCents = Math.round(parseFloat(editBalance) * 100)
              const balanceChanged = !isNaN(newBalanceCents) && newBalanceCents !== wallet.balance

              return (
                <div
                  key={wallet.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                  }}
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Wallet name"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSave()
                      if (e.key === 'Escape') setEditingWalletId(null)
                    }}
                    style={{
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px var(--space-2)',
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--font-size-small)',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-focused)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)' }}>
                      ₱
                    </span>
                    <input
                      type="number"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      placeholder="Balance"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave()
                        if (e.key === 'Escape') setEditingWalletId(null)
                      }}
                      style={{
                        flex: 1,
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px var(--space-2)',
                        color: 'var(--color-text-primary)',
                        fontSize: 'var(--font-size-small)',
                        outline: 'none',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border-focused)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)'
                      }}
                    />
                  </div>
                  {balanceChanged && (
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Salary deposit, ATM withdrawal"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave()
                        if (e.key === 'Escape') setEditingWalletId(null)
                      }}
                      style={{
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px var(--space-2)',
                        color: 'var(--color-text-primary)',
                        fontSize: 'var(--font-size-small)',
                        outline: 'none',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border-focused)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)'
                      }}
                    />
                  )}
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                      onClick={() => setEditingWalletId(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px 0',
                        cursor: 'pointer',
                        fontSize: 'var(--font-size-small)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditSave}
                      style={{
                        background: 'var(--color-accent)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px var(--space-2)',
                        cursor: 'pointer',
                        fontSize: 'var(--font-size-small)',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onEdit={() => {
                  setEditingWalletId(wallet.id)
                  setEditName(wallet.name)
                  setEditBalance(String(wallet.balance / 100))
                  setEditDescription('')
                }}
                onAdjust={() => onAdjustBalance(wallet)}
                onViewHistory={() => onViewHistory(wallet.id)}
              />
            )
          })
        )}
      </div>

      {/* Add wallet button (bottom, only when wallets exist) */}
      {wallets.length > 0 && !showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-accent)',
            textAlign: 'left',
          }}
        >
          + Add Wallet
        </button>
      )}
    </div>
  )
}
