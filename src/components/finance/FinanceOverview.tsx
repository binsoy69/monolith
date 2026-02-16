"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { MonthlySummaryCard } from "./MonthlySummaryCard";
import { Suspense, lazy } from "react";
import { WalletCard } from "./WalletCard";
import { WalletFormDialog } from "./WalletFormDialog";
import { CategoryManagerDialog } from "./CategoryManagerDialog";
import { RecentTransactions } from "./RecentTransactions";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
const CategoryPieChart = lazy(() => import("./CategoryPieChart"));
const TrendLineChart = lazy(() => import("./TrendLineChart"));
import { Skeleton } from "@/components/ui/skeleton";
import type {
  Transaction,
  FinanceCategory,
  FinanceAccount,
} from "@/lib/services/finance.service";

interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  net: number;
  byCategory: {
    categoryId: number;
    name: string;
    color: string;
    total: number;
  }[];
}

interface TrendData {
  month: string;
  income: number;
  expense: number;
}

export function FinanceOverview() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [prevSummary, setPrevSummary] = useState<MonthlySummary | null>(null);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<FinanceAccount | null>(null);
  const [deletingWallet, setDeletingWallet] = useState<FinanceAccount | null>(null);

  const monthLabel = new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const fetchData = useCallback(async (): Promise<{
    summary: MonthlySummary | null;
    prevSummary: MonthlySummary | null;
    accounts: FinanceAccount[];
    recentTxns: Transaction[];
    categories: FinanceCategory[];
  } | null> => {
    try {
      const prevDate = new Date(year, month - 2, 1);
      const prevY = prevDate.getFullYear();
      const prevM = prevDate.getMonth() + 1;

      const [summaryRes, prevSummaryRes, accountsRes, recentRes, categoriesRes] = await Promise.all([
        fetch(`/api/finance/summary?year=${year}&month=${month}`),
        fetch(`/api/finance/summary?year=${prevY}&month=${prevM}`),
        fetch("/api/finance/accounts"),
        fetch("/api/finance/transactions/recent"),
        fetch("/api/finance/categories"),
      ]);

      return {
        summary: summaryRes.ok ? await summaryRes.json() : null,
        prevSummary: prevSummaryRes.ok ? await prevSummaryRes.json() : null,
        accounts: accountsRes.ok ? await accountsRes.json() : [],
        recentTxns: recentRes.ok ? await recentRes.json() : [],
        categories: categoriesRes.ok ? await categoriesRes.json() : [],
      };
    } catch {
      toast.error("Failed to load finance data");
      return null;
    }
  }, [year, month]);

  const fetchTrend = useCallback(async (): Promise<TrendData[]> => {
    try {
      const data: TrendData[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(year, month - 1 - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const res = await fetch(`/api/finance/summary?year=${y}&month=${m}`);
        if (res.ok) {
          const s = await res.json();
          const label = d.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          });
          data.push({
            month: label,
            income: s.totalIncome,
            expense: s.totalExpense,
          });
        }
      }
      return data;
    } catch {
      return [];
    }
  }, [year, month]);

  const refreshData = useCallback(() => {
    void fetchData().then((data) => {
      if (!data) return;
      setSummary(data.summary);
      setPrevSummary(data.prevSummary);
      setAccounts(data.accounts);
      setRecentTxns(data.recentTxns);
      setCategories(data.categories);
    });
    void fetchTrend().then((data) => {
      setTrend(data);
    });
  }, [fetchData, fetchTrend]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  async function handleCreateWallet(data: {
    name: string;
    balance: number;
    icon: string;
    color: string;
  }) {
    try {
      const res = await fetch("/api/finance/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Wallet created");
      setWalletDialogOpen(false);
      refreshData();
    } catch {
      toast.error("Failed to create wallet");
      throw new Error("Create wallet failed");
    }
  }

  async function handleEditWallet(data: {
    name: string;
    balance: number;
    icon: string;
    color: string;
  }) {
    if (!editingWallet) return;
    try {
      const res = await fetch(`/api/finance/accounts/${editingWallet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          icon: data.icon,
          color: data.color,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Wallet updated");
      setEditingWallet(null);
      refreshData();
    } catch {
      toast.error("Failed to update wallet");
      throw new Error("Update wallet failed");
    }
  }

  async function handleDeleteWallet() {
    if (!deletingWallet) return;
    try {
      const res = await fetch(`/api/finance/accounts/${deletingWallet.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Wallet deleted");
      setDeletingWallet(null);
      refreshData();
    } catch {
      toast.error("Failed to delete wallet");
      throw new Error("Delete wallet failed");
    }
  }

  function prevMonth() {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-[160px] text-center">
            {monthLabel}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCategoryDialogOpen(true)}
          >
            Manage Categories
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/finance/transactions">View Transactions</Link>
          </Button>
        </div>
      </div>

      <WalletCard
        accounts={accounts}
        onAddWallet={() => setWalletDialogOpen(true)}
        onEditWallet={(account) => setEditingWallet(account)}
        onDeleteWallet={(account) => setDeletingWallet(account)}
      />

      {summary && (
        <MonthlySummaryCard
          totalIncome={summary.totalIncome}
          totalExpense={summary.totalExpense}
          net={summary.net}
          prevIncome={prevSummary?.totalIncome}
          prevExpense={prevSummary?.totalExpense}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <CategoryPieChart data={summary?.byCategory ?? []} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <TrendLineChart data={trend} />
        </Suspense>
      </div>

      <RecentTransactions transactions={recentTxns} categories={categories} />

      <WalletFormDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        onSubmit={handleCreateWallet}
      />

      <WalletFormDialog
        open={!!editingWallet}
        onOpenChange={(open) => {
          if (!open) setEditingWallet(null);
        }}
        onSubmit={handleEditWallet}
        initialData={editingWallet ? {
          id: editingWallet.id,
          name: editingWallet.name,
          icon: editingWallet.icon,
          color: editingWallet.color,
        } : undefined}
      />

      <DeleteConfirmDialog
        open={!!deletingWallet}
        onOpenChange={(open) => {
          if (!open) setDeletingWallet(null);
        }}
        title="Delete Wallet"
        description={`This will permanently delete "${deletingWallet?.name}" and all its transactions. This action cannot be undone.`}
        onConfirm={handleDeleteWallet}
      />

      <CategoryManagerDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onCategoriesChanged={refreshData}
      />
    </div>
  );
}
