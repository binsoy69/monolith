import { useEffect, useState } from 'react'
import { ModuleHeader } from '../shell/ModuleHeader'
import { WalletPanel } from './WalletPanel'
import { BalanceAdjustModal } from './BalanceAdjustModal'
import { ExpenseLogModal } from './ExpenseLogModal'
import { ExpenseList } from './ExpenseList'
import { CategoryManageView } from './CategoryManageView'
import { useExpensesStore } from './expenses-store'
import { useContextMenu } from '../shared/useContextMenu'
import { ContextMenu } from '../shared/ContextMenu'
import type { Wallet, Expense } from '../../shared/domain-types'

interface ExpensesViewProps {
  newItemTrigger?: number
}

export function ExpensesView({ newItemTrigger }: ExpensesViewProps) {
  const {
    wallets,
    categories,
    expenses,
    filters,
    walletsLoaded,
    loadWallets,
    loadCategories,
    loadExpenses,
    createWallet,
    adjustWalletBalance,
    createExpense,
    updateExpense,
    deleteExpense,
    createCategory,
    updateCategory,
    deleteCategory,
    setFilters,
    clearFilters,
  } = useExpensesStore()

  const [adjustingWallet, setAdjustingWallet] = useState<Wallet | null>(null)
  const [showLogModal, setShowLogModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null)
  const [showCategoryManage, setShowCategoryManage] = useState(false)
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu()

  useEffect(() => {
    if (!walletsLoaded) loadWallets()
    loadCategories()
    loadExpenses()
  }, [])

  // Reload expenses when filters change
  useEffect(() => {
    loadExpenses()
  }, [filters])

  // "N" key shortcut: open log modal when in expenses module
  useEffect(() => {
    if (newItemTrigger && newItemTrigger > 0 && wallets.length > 0) {
      setShowLogModal(true)
    }
  }, [newItemTrigger])

  function handleAdjustSave(mode: 'set' | 'delta', amount: number) {
    if (!adjustingWallet) return
    adjustWalletBalance(adjustingWallet.id, mode, amount)
    setAdjustingWallet(null)
  }

  async function handleModalSave(data: {
    amount: number
    date: string
    categoryId: string
    walletId: string
    notes?: string
  }) {
    if (editingExpense) {
      await updateExpense(editingExpense.id, data)
    } else {
      await createExpense(data)
    }
    setShowLogModal(false)
    setEditingExpense(null)
    // Reload wallets to reflect balance changes
    loadWallets()
    loadExpenses()
  }

  function handleExpenseContextMenu(e: React.MouseEvent, expense: Expense) {
    showContextMenu(e, [
      {
        label: 'Edit',
        onClick: () => {
          setEditingExpense(expense)
          setShowLogModal(true)
        },
      },
      {
        label: 'Delete',
        destructive: true,
        onClick: () => {
          setDeletingExpenseId(expense.id)
        },
      },
    ])
  }

  function handleConfirmDelete() {
    if (!deletingExpenseId) return
    deleteExpense(deletingExpenseId)
    setDeletingExpenseId(null)
    loadWallets()
  }

  const canLog = wallets.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ModuleHeader
        moduleId="expenses"
        right={
          <button
            disabled={!canLog}
            onClick={() => {
              if (canLog) {
                setEditingExpense(null)
                setShowLogModal(true)
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: canLog ? 'pointer' : 'not-allowed',
              fontSize: 'var(--font-size-small)',
              color: canLog ? 'var(--color-accent)' : 'var(--color-text-muted)',
              opacity: canLog ? 1 : 0.5,
            }}
          >
            + Log Expense
          </button>
        }
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <WalletPanel
          wallets={wallets}
          onCreateWallet={createWallet}
          onEditWallet={(id) => {
            console.log('Edit wallet', id)
          }}
          onAdjustBalance={(wallet) => setAdjustingWallet(wallet)}
        />
        {/* Right panel — expense list + category management */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <ExpenseList
              expenses={expenses}
              categories={categories}
              wallets={wallets}
              filters={filters}
              onFiltersChange={(f) => setFilters(f)}
              onClearFilters={clearFilters}
              onContextMenu={handleExpenseContextMenu}
            />
          </div>

          {/* Manage categories toggle */}
          <div
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderTop: showCategoryManage ? 'none' : '1px solid var(--color-border)',
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setShowCategoryManage((v) => !v)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--font-size-small)',
                color: showCategoryManage ? 'var(--color-accent)' : 'var(--color-text-muted)',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.color = showCategoryManage
                  ? 'var(--color-accent-hover)'
                  : 'var(--color-text-secondary)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.color = showCategoryManage
                  ? 'var(--color-accent)'
                  : 'var(--color-text-muted)'
              }}
            >
              {showCategoryManage ? 'Hide categories' : 'Manage categories'}
            </button>

            {showCategoryManage && (
              <CategoryManageView
                categories={categories}
                onUpdate={(id, data) => updateCategory(id, data)}
                onDelete={deleteCategory}
              />
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {deletingExpenseId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1400,
          }}
          onClick={() => setDeletingExpenseId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--color-bg-overlay)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              maxWidth: '320px',
              width: '100%',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            <p
              style={{
                margin: '0 0 var(--space-4) 0',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text-primary)',
              }}
            >
              Delete this expense? This will reverse the wallet deduction.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeletingExpenseId(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-body)',
                  padding: 'var(--space-1) var(--space-2)',
                }}
              >
                Keep Expense
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-destructive)',
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 600,
                  padding: 'var(--space-1) var(--space-2)',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {adjustingWallet && (
        <BalanceAdjustModal
          wallet={adjustingWallet}
          onSave={handleAdjustSave}
          onClose={() => setAdjustingWallet(null)}
        />
      )}

      {showLogModal && (
        <ExpenseLogModal
          mode={editingExpense ? 'edit' : 'create'}
          expense={editingExpense ?? undefined}
          categories={categories}
          wallets={wallets}
          onSave={handleModalSave}
          onClose={() => {
            setShowLogModal(false)
            setEditingExpense(null)
          }}
          onCreateCategory={createCategory}
        />
      )}

      {contextMenu && (
        <ContextMenu
          items={contextMenu.items}
          position={contextMenu.position}
          onClose={hideContextMenu}
        />
      )}
    </div>
  )
}
