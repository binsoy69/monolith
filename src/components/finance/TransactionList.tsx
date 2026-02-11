"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { TransactionRow } from "./TransactionRow";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionFormDialog } from "./TransactionFormDialog";
import type { Transaction, FinanceCategory, FinanceAccount } from "@/lib/services/finance.service";

export function TransactionList() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAccount, setFilterAccount] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filterType !== "all") params.set("type", filterType);
      if (filterCategory !== "all") params.set("categoryId", filterCategory);
      if (filterAccount !== "all") params.set("accountId", filterAccount);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/finance/transactions?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTxns(data.transactions);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load transactions");
    }
  }, [page, filterType, filterCategory, filterAccount, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    Promise.all([
      fetch("/api/finance/categories").then((r) => r.json()),
      fetch("/api/finance/accounts").then((r) => r.json()),
    ]).then(([cats, accs]) => {
      setCategories(cats);
      setAccounts(accs);
    }).catch(() => {});
  }, []);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  async function handleCreateTransaction(data: {
    type: string;
    amount: number;
    description?: string;
    categoryId?: number | null;
    accountId: number;
    toAccountId?: number | null;
    transactionDate: string;
  }) {
    const res = await fetch("/api/finance/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    toast.success("Transaction created");
    fetchTransactions();
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <TransactionFilters
          type={filterType}
          categoryId={filterCategory}
          accountId={filterAccount}
          startDate={startDate}
          endDate={endDate}
          categories={categories}
          accounts={accounts}
          onTypeChange={(v) => { setFilterType(v); setPage(1); }}
          onCategoryChange={(v) => { setFilterCategory(v); setPage(1); }}
          onAccountChange={(v) => { setFilterAccount(v); setPage(1); }}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Transaction
        </Button>
      </div>

      <div className="space-y-2">
        {txns.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No transactions yet. Start tracking your finances!
          </div>
        ) : (
          txns.map((txn) => (
            <TransactionRow
              key={txn.id}
              transaction={txn}
              categoryName={txn.categoryId ? categoryMap.get(txn.categoryId) : undefined}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <TransactionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        accounts={accounts}
        onSubmit={handleCreateTransaction}
      />
    </div>
  );
}
