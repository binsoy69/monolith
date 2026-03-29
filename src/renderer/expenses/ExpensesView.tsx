import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ModuleHeader } from "../shell/ModuleHeader";
import { WalletPanel } from "./WalletPanel";
import { BalanceAdjustModal } from "./BalanceAdjustModal";
import { ExpenseLogModal } from "./ExpenseLogModal";
import { ExpenseList } from "./ExpenseList";
import { ExpenseAnalyticsSection } from "./ExpenseAnalyticsSection";
import { CategoryManageView } from "./CategoryManageView";
import { WalletHistoryModal } from "./WalletHistoryModal";
import { useExpensesStore } from "./expenses-store";
import { useContextMenu } from "../shared/useContextMenu";
import { ContextMenu } from "../shared/ContextMenu";
import type { ContextMenuItem } from "../shared/ContextMenu";
import type { Wallet, Expense } from "../../shared/domain-types";
import { TagCreateDialog } from "../tags/TagCreateDialog";
import { useTagsStore } from "../tags/tags-store";

interface ExpensesViewProps {
  newItemTrigger?: number;
  highlightExpenseId?: string;
}

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function ExpensesView({
  newItemTrigger,
  highlightExpenseId,
}: ExpensesViewProps): React.JSX.Element {
  const {
    wallets,
    categories,
    expenses,
    analytics,
    filters,
    trendMonths,
    walletsLoaded,
    categoriesLoaded,
    loadWallets,
    loadCategories,
    loadExpenses,
    loadAnalytics,
    createWallet,
    updateWallet,
    adjustWalletBalance,
    createExpense,
    updateExpense,
    deleteExpense,
    createCategory,
    updateCategory,
    deleteCategory,
    setFilters,
    clearFilters,
    setTrendMonths,
  } = useExpensesStore(
    useShallow((state) => ({
      wallets: state.wallets,
      categories: state.categories,
      expenses: state.expenses,
      analytics: state.analytics,
      filters: state.filters,
      trendMonths: state.trendMonths,
      walletsLoaded: state.walletsLoaded,
      categoriesLoaded: state.categoriesLoaded,
      loadWallets: state.loadWallets,
      loadCategories: state.loadCategories,
      loadExpenses: state.loadExpenses,
      loadAnalytics: state.loadAnalytics,
      createWallet: state.createWallet,
      updateWallet: state.updateWallet,
      adjustWalletBalance: state.adjustWalletBalance,
      createExpense: state.createExpense,
      updateExpense: state.updateExpense,
      deleteExpense: state.deleteExpense,
      createCategory: state.createCategory,
      updateCategory: state.updateCategory,
      deleteCategory: state.deleteCategory,
      setFilters: state.setFilters,
      clearFilters: state.clearFilters,
      setTrendMonths: state.setTrendMonths,
    })),
  );

  const [adjustingWallet, setAdjustingWallet] = useState<Wallet | null>(null);
  const [historyWalletId, setHistoryWalletId] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null,
  );
  const [showCategoryManage, setShowCategoryManage] = useState(false);
  const [currentMonthKey] = useState(() => getCurrentMonthKey());
  const [isChartAnimationActive] = useState(() =>
    typeof window === "undefined" || typeof window.matchMedia !== "function"
      ? true
      : !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [tagDialogExpenseId, setTagDialogExpenseId] = useState<string | null>(
    null,
  );
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();
  const ensureItemTags = useTagsStore((state) => state.ensureItemTags);
  const setTagAssignment = useTagsStore((state) => state.setTagAssignment);
  const createTag = useTagsStore((state) => state.createTag);
  const selectedHistoryWallet = historyWalletId
    ? (wallets.find((wallet) => wallet.id === historyWalletId) ?? null)
    : null;

  useEffect(() => {
    if (!walletsLoaded) {
      void loadWallets();
    }
    if (!categoriesLoaded) {
      void loadCategories();
    }
  }, [categoriesLoaded, loadCategories, loadWallets, walletsLoaded]);

  useEffect(() => {
    void loadAnalytics(currentMonthKey, trendMonths);
  }, [currentMonthKey, loadAnalytics, trendMonths]);

  // Reload expenses when filters change
  useEffect(() => {
    void loadExpenses();
  }, [filters, loadExpenses]);

  // "N" key shortcut: open log modal when in expenses module
  useEffect(() => {
    if (newItemTrigger && newItemTrigger > 0 && wallets.length > 0) {
      // This is driven by a parent shortcut/event trigger, not derived UI state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowLogModal(true);
    }
  }, [newItemTrigger, wallets.length]);

  function handleAdjustSave(
    mode: "set" | "delta",
    amount: number,
    description?: string,
  ): void {
    if (!adjustingWallet) return;
    adjustWalletBalance(adjustingWallet.id, mode, amount, description);
    setAdjustingWallet(null);
  }

  async function handleModalSave(data: {
    amount: number;
    date: string;
    categoryId: string;
    walletId: string;
    notes?: string;
  }): Promise<void> {
    if (editingExpense) {
      await updateExpense(editingExpense.id, data);
    } else {
      await createExpense(data);
    }
    setShowLogModal(false);
    setEditingExpense(null);
    void loadAnalytics(currentMonthKey, trendMonths);
  }

  async function handleExpenseContextMenu(
    e: React.MouseEvent,
    expense: Expense,
  ): Promise<void> {
    const assignedTags = await ensureItemTags("expense", expense.id);
    const assignedTagIds = new Set(assignedTags.map((tag) => tag.id));
    const tags = useTagsStore.getState().tags;
    const tagChildren: ContextMenuItem[] = [
      ...tags.map((tag) => ({
        label: tag.name,
        checked: assignedTagIds.has(tag.id),
        closeOnClick: false,
        onClick: () => {
          void (async () => {
            const latestAssigned = await useTagsStore
              .getState()
              .ensureItemTags("expense", expense.id);
            const isAssigned = latestAssigned.some(
              (entry) => entry.id === tag.id,
            );
            await useTagsStore
              .getState()
              .setTagAssignment("expense", expense.id, tag.id, !isAssigned);
          })();
        },
      })),
      {
        label: "New tag...",
        onClick: () => setTagDialogExpenseId(expense.id),
      },
    ];

    showContextMenu(e, [
      {
        label: "Edit",
        onClick: () => {
          setEditingExpense(expense);
          setShowLogModal(true);
        },
      },
      {
        label: "Tags",
        onClick: () => {},
        children: tagChildren,
      },
      {
        label: "Delete",
        destructive: true,
        onClick: () => {
          setDeletingExpenseId(expense.id);
        },
      },
    ]);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!deletingExpenseId) return;
    await deleteExpense(deletingExpenseId);
    setDeletingExpenseId(null);
    void loadAnalytics(currentMonthKey, trendMonths);
  }

  const canLog = wallets.length > 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <ModuleHeader
        moduleId="expenses"
        right={
          <button
            disabled={!canLog}
            onClick={() => {
              if (canLog) {
                setEditingExpense(null);
                setShowLogModal(true);
              }
            }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: canLog ? "pointer" : "not-allowed",
              fontSize: "var(--font-size-small)",
              color: canLog ? "var(--color-accent)" : "var(--color-text-muted)",
              opacity: canLog ? 1 : 0.5,
            }}
          >
            + Log Expense
          </button>
        }
      />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <WalletPanel
          wallets={wallets}
          onCreateWallet={createWallet}
          onUpdateWallet={updateWallet}
          onAdjustBalance={(wallet) => setAdjustingWallet(wallet)}
          onViewHistory={(walletId) => setHistoryWalletId(walletId)}
        />
        {/* Right panel — expense list + category management */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "var(--space-4) var(--space-4) 0",
              flexShrink: 0,
            }}
          >
            <ExpenseAnalyticsSection
              analytics={analytics}
              isOpen={showAnalytics}
              trendMonths={trendMonths}
              onToggle={() => setShowAnalytics((value) => !value)}
              onSelectTrendMonths={setTrendMonths}
              isAnimationActive={isChartAnimationActive}
            />
          </div>
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ExpenseList
              expenses={expenses}
              categories={categories}
              wallets={wallets}
              filters={filters}
              onFiltersChange={(f) => setFilters(f)}
              onClearFilters={clearFilters}
              onContextMenu={handleExpenseContextMenu}
              highlightExpenseId={highlightExpenseId}
            />
          </div>

          {/* Manage categories toggle */}
          <div
            style={{
              padding: "var(--space-2) var(--space-4)",
              borderTop: showCategoryManage
                ? "none"
                : "1px solid var(--color-border)",
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setShowCategoryManage((v) => !v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "var(--font-size-small)",
                color: showCategoryManage
                  ? "var(--color-accent)"
                  : "var(--color-text-secondary)",
                padding: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  showCategoryManage
                    ? "var(--color-accent-hover)"
                    : "var(--color-text-secondary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  showCategoryManage
                    ? "var(--color-accent)"
                    : "var(--color-text-secondary)";
              }}
            >
              {showCategoryManage ? "Hide categories" : "Manage categories"}
            </button>

            {showCategoryManage && (
              <CategoryManageView
                categories={categories}
                onUpdate={(id, data) => updateCategory(id, data)}
                onDelete={deleteCategory}
                onCreate={createCategory}
              />
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {deletingExpenseId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1400,
          }}
          onClick={() => setDeletingExpenseId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--color-bg-overlay)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-4)",
              maxWidth: "320px",
              width: "100%",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}
          >
            <p
              style={{
                margin: "0 0 var(--space-4) 0",
                fontSize: "var(--font-size-body)",
                color: "var(--color-text-primary)",
              }}
            >
              Delete this expense? This will reverse the wallet deduction.
            </p>
            <div
              style={{
                display: "flex",
                gap: "var(--space-2)",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setDeletingExpenseId(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--font-size-body)",
                  padding: "var(--space-1) var(--space-2)",
                }}
              >
                Keep Expense
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-destructive)",
                  fontSize: "var(--font-size-body)",
                  fontWeight: 600,
                  padding: "var(--space-1) var(--space-2)",
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

      {selectedHistoryWallet && (
        <WalletHistoryModal
          key={selectedHistoryWallet.id}
          wallet={selectedHistoryWallet}
          onClose={() => setHistoryWalletId(null)}
        />
      )}

      {showLogModal && (
        <ExpenseLogModal
          mode={editingExpense ? "edit" : "create"}
          expense={editingExpense ?? undefined}
          categories={categories}
          wallets={wallets}
          onSave={handleModalSave}
          onClose={() => {
            setShowLogModal(false);
            setEditingExpense(null);
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

      <TagCreateDialog
        isOpen={tagDialogExpenseId !== null}
        onClose={() => setTagDialogExpenseId(null)}
        onCreate={async (name) => {
          const tag = await createTag(name);
          if (tag && tagDialogExpenseId) {
            await setTagAssignment("expense", tagDialogExpenseId, tag.id, true);
          }
          setTagDialogExpenseId(null);
        }}
      />
    </div>
  );
}
