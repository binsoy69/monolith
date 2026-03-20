import { useEffect, useState } from 'react'
import { ModuleHeader } from '../shell/ModuleHeader'
import { WalletPanel } from './WalletPanel'
import { BalanceAdjustModal } from './BalanceAdjustModal'
import { useExpensesStore } from './expenses-store'
import type { Wallet } from '../../shared/domain-types'

export function ExpensesView() {
  const {
    wallets,
    walletsLoaded,
    loadWallets,
    loadCategories,
    createWallet,
    adjustWalletBalance,
  } = useExpensesStore()

  const [adjustingWallet, setAdjustingWallet] = useState<Wallet | null>(null)

  useEffect(() => {
    if (!walletsLoaded) loadWallets()
    loadCategories()
  }, [])

  function handleAdjustSave(mode: 'set' | 'delta', amount: number) {
    if (!adjustingWallet) return
    adjustWalletBalance(adjustingWallet.id, mode, amount)
    setAdjustingWallet(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ModuleHeader
        moduleId="expenses"
        right={
          <button
            disabled={wallets.length === 0}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: wallets.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-small)',
              color: wallets.length === 0 ? 'var(--color-text-muted)' : 'var(--color-accent)',
              opacity: wallets.length === 0 ? 0.5 : 1,
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
            // Edit inline — future implementation if needed
            console.log('Edit wallet', id)
          }}
          onAdjustBalance={(wallet) => setAdjustingWallet(wallet)}
        />
        {/* Right panel — expense list (built in plan 02-06) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {wallets.length === 0 ? null : (
            <span
              style={{
                color: 'var(--color-text-muted)',
                fontSize: 'var(--font-size-body)',
              }}
            >
              No expenses logged
            </span>
          )}
        </div>
      </div>

      {adjustingWallet && (
        <BalanceAdjustModal
          wallet={adjustingWallet}
          onSave={handleAdjustSave}
          onClose={() => setAdjustingWallet(null)}
        />
      )}
    </div>
  )
}
