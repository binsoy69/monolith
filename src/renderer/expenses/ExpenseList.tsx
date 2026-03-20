import type { Expense, Category, Wallet } from '../../shared/domain-types'
import { ExpenseFilterBar } from './ExpenseFilterBar'
import { ExpenseRow } from './ExpenseRow'

interface ExpenseListProps {
  expenses: Expense[]
  categories: Category[]
  wallets: Wallet[]
  filters: { startDate?: string; endDate?: string; categoryId?: string }
  onFiltersChange: (filters: { startDate?: string; endDate?: string; categoryId?: string }) => void
  onClearFilters: () => void
  onContextMenu: (e: React.MouseEvent, expense: Expense) => void
}

export function ExpenseList({
  expenses,
  categories,
  wallets,
  filters,
  onFiltersChange,
  onClearFilters,
  onContextMenu,
}: ExpenseListProps) {
  function getCategoryById(id: string): Category | undefined {
    return categories.find((c) => c.id === id)
  }

  function getWalletName(id: string | null): string {
    if (!id) return ''
    return wallets.find((w) => w.id === id)?.name ?? ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ExpenseFilterBar
        filters={filters}
        categories={categories}
        onFiltersChange={onFiltersChange}
        onClear={onClearFilters}
      />

      {/* Expense rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {expenses.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 'var(--space-2)',
            }}
          >
            <span
              style={{
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
              }}
            >
              No expenses logged
            </span>
            <span
              style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--color-text-muted)',
              }}
            >
              Your expense history will appear here.
            </span>
          </div>
        ) : (
          expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              category={getCategoryById(expense.categoryId)}
              walletName={getWalletName(expense.walletId)}
              onContextMenu={(e) => onContextMenu(e, expense)}
            />
          ))
        )}
      </div>
    </div>
  )
}
