import type { Expense, Category, Wallet } from "../../shared/domain-types";
import { ExpenseFilterBar } from "./ExpenseFilterBar";
import { ExpenseRow } from "./ExpenseRow";

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  wallets: Wallet[];
  filters: { startDate?: string; endDate?: string; categoryId?: string };
  onFiltersChange: (filters: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
  }) => void;
  onClearFilters: () => void;
  onContextMenu: (e: React.MouseEvent, expense: Expense) => void;
  highlightExpenseId?: string;
}

export function ExpenseList({
  expenses,
  categories,
  wallets,
  filters,
  onFiltersChange,
  onClearFilters,
  onContextMenu,
  highlightExpenseId,
}: ExpenseListProps): React.JSX.Element {
  const categoriesById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const walletNamesById = new Map(
    wallets.map((wallet) => [wallet.id, wallet.name]),
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <ExpenseFilterBar
        filters={filters}
        categories={categories}
        onFiltersChange={onFiltersChange}
        onClear={onClearFilters}
      />

      {/* Expense rows */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {expenses.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: "var(--space-2)",
            }}
          >
            <span
              style={{
                fontSize: "var(--font-size-body)",
                color: "var(--color-text-muted)",
                fontWeight: 600,
              }}
            >
              No expenses logged
            </span>
            <span
              style={{
                fontSize: "var(--font-size-small)",
                color: "var(--color-text-muted)",
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
              category={categoriesById.get(expense.categoryId)}
              walletName={
                expense.walletId
                  ? (walletNamesById.get(expense.walletId) ?? "")
                  : ""
              }
              onContextMenu={(e) => onContextMenu(e, expense)}
              isHighlighted={highlightExpenseId === expense.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
