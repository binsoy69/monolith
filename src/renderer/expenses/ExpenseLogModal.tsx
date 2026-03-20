import { useState, useEffect } from 'react'
import type { Category, Wallet, Expense } from '../../shared/domain-types'
import { CategoryPicker } from './CategoryPicker'

function todayISO(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface ExpenseFormData {
  amount: number
  date: string
  categoryId: string
  walletId: string
  notes?: string
}

interface ExpenseLogModalProps {
  mode: 'create' | 'edit'
  expense?: Expense
  categories: Category[]
  wallets: Wallet[]
  onSave: (data: ExpenseFormData) => void
  onClose: () => void
  onCreateCategory: (data: { name: string; color: string }) => Promise<Category | null>
}

export function ExpenseLogModal({
  mode,
  expense,
  categories,
  wallets,
  onSave,
  onClose,
  onCreateCategory,
}: ExpenseLogModalProps) {
  const [amountStr, setAmountStr] = useState(
    mode === 'edit' && expense ? String(expense.amount / 100) : ''
  )
  const [date, setDate] = useState(
    mode === 'edit' && expense ? expense.date : todayISO()
  )
  const [categoryId, setCategoryId] = useState<string>(
    mode === 'edit' && expense ? expense.categoryId : ''
  )
  const [walletId, setWalletId] = useState<string>(
    mode === 'edit' && expense && expense.walletId ? expense.walletId : ''
  )
  const [notes, setNotes] = useState(
    mode === 'edit' && expense?.notes ? expense.notes : ''
  )
  const [errors, setErrors] = useState<{ amount?: boolean; category?: boolean; wallet?: boolean }>({})

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleSubmit() {
    const newErrors: typeof errors = {}
    const parsed = parseFloat(amountStr)
    if (!amountStr || isNaN(parsed) || parsed <= 0) newErrors.amount = true
    if (!categoryId) newErrors.category = true
    if (!walletId) newErrors.wallet = true

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const amount = Math.round(parsed * 100)
    onSave({ amount, date, categoryId, walletId, notes: notes || undefined })
  }

  return (
    /* Overlay */
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1500,
      }}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '400px',
          backgroundColor: 'var(--color-bg-overlay)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Title */}
        <h2
          style={{
            margin: '0 0 var(--space-6) 0',
            fontSize: 'var(--font-size-heading)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          {mode === 'edit' ? 'Edit Expense' : 'Log Expense'}
        </h2>

        {/* Form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Amount */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-size-small)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-1)',
              }}
            >
              Amount
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 'var(--space-2)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-body)',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                ₱
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value)
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: false }))
                }}
                placeholder="0"
                style={{
                  width: '100%',
                  height: '36px',
                  paddingLeft: '20px',
                  paddingRight: 'var(--space-2)',
                  background: 'var(--color-bg-base)',
                  border: `1px solid ${errors.amount ? 'var(--color-destructive)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-body)',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  if (!errors.amount) {
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-focused)'
                  }
                }}
                onBlur={(e) => {
                  if (!errors.amount) {
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
                  }
                }}
              />
            </div>
            {errors.amount && (
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--color-destructive)' }}>
                Enter a valid amount greater than 0
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-size-small)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-1)',
              }}
            >
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 var(--space-2)',
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-body)',
                outline: 'none',
                colorScheme: 'dark',
              }}
              onFocus={(e) => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-focused)'
              }}
              onBlur={(e) => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-size-small)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-1)',
              }}
            >
              Category
            </label>
            <CategoryPicker
              categories={categories}
              selectedId={categoryId || null}
              onChange={(id) => {
                setCategoryId(id)
                if (errors.category) setErrors((prev) => ({ ...prev, category: false }))
              }}
              onCreateCategory={onCreateCategory}
              hasError={errors.category}
            />
            {errors.category && (
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--color-destructive)' }}>
                Select a category
              </p>
            )}
          </div>

          {/* Wallet */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-size-small)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-1)',
              }}
            >
              Wallet
            </label>
            <select
              value={walletId}
              onChange={(e) => {
                setWalletId(e.target.value)
                if (errors.wallet) setErrors((prev) => ({ ...prev, wallet: false }))
              }}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 var(--space-2)',
                background: 'var(--color-bg-base)',
                border: `1px solid ${errors.wallet ? 'var(--color-destructive)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-sm)',
                color: walletId ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                fontSize: 'var(--font-size-body)',
                outline: 'none',
                cursor: 'pointer',
              }}
              onFocus={(e) => {
                if (!errors.wallet) {
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-focused)'
                }
              }}
              onBlur={(e) => {
                if (!errors.wallet) {
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
                }
              }}
            >
              <option value="" disabled>
                Select wallet
              </option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            {errors.wallet && (
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--color-destructive)' }}>
                Select a wallet
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-size-small)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-1)',
              }}
            >
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was this for?"
              rows={2}
              style={{
                width: '100%',
                padding: 'var(--space-2)',
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-body)',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                lineHeight: 'var(--line-height-normal)',
              }}
              onFocus={(e) => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-focused)'
              }}
              onBlur={(e) => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
              }}
            />
          </div>
        </div>

        {/* Bottom action row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-6)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-body)',
              borderRadius: 'var(--radius-sm)',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'
            }}
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              background: 'var(--color-accent)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              color: 'white',
              fontSize: 'var(--font-size-body)',
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-accent-hover)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-accent)'
            }}
          >
            {mode === 'edit' ? 'Save Changes' : 'Log Expense'}
          </button>
        </div>
      </div>
    </div>
  )
}
