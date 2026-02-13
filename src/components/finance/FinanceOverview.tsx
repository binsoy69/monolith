"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { MonthlySummaryCard } from "./MonthlySummaryCard";
import { CategoryPieChart } from "./CategoryPieChart";
import { TrendLineChart } from "./TrendLineChart";
import { BudgetStatusList } from "./BudgetStatusList";
import { SavingsGoalCard } from "./SavingsGoalCard";
import { AccountCard } from "./AccountCard";
import type { BudgetWithSpent, SavingsGoal, FinanceAccount } from "@/lib/services/finance.service";

interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  net: number;
  byCategory: { categoryId: number; name: string; color: string; total: number }[];
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
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);

  const monthLabel = new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const fetchData = useCallback(async (): Promise<{
    summary: MonthlySummary | null;
    budgets: BudgetWithSpent[];
    goals: SavingsGoal[];
    accounts: FinanceAccount[];
  } | null> => {
    try {
      const [summaryRes, budgetsRes, goalsRes, accountsRes] = await Promise.all([
        fetch(`/api/finance/summary?year=${year}&month=${month}`),
        fetch("/api/finance/budgets"),
        fetch("/api/finance/goals"),
        fetch("/api/finance/accounts"),
      ]);

      const summary = summaryRes.ok
        ? (await summaryRes.json()) as MonthlySummary
        : null;
      const budgets = budgetsRes.ok
        ? (await budgetsRes.json()) as BudgetWithSpent[]
        : [];
      const goals = goalsRes.ok
        ? (await goalsRes.json()) as SavingsGoal[]
        : [];
      const accounts = accountsRes.ok
        ? (await accountsRes.json()) as FinanceAccount[]
        : [];

      return { summary, budgets, goals, accounts };
    } catch {
      toast.error("Failed to load finance data");
      return null;
    }
  }, [year, month]);

  const fetchTrend = useCallback(async (): Promise<TrendData[]> => {
    try {
      // Manually build trend from summaries for 6 months
      const data: TrendData[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(year, month - 1 - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const res = await fetch(`/api/finance/summary?year=${y}&month=${m}`);
        if (res.ok) {
          const s = await res.json();
          const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
          data.push({ month: label, income: s.totalIncome, expense: s.totalExpense });
        }
      }
      return data;
    } catch {
      // Trend is non-critical
      return [];
    }
  }, [year, month]);

  useEffect(() => {
    void fetchData().then((data) => {
      if (!data) return;
      setSummary(data.summary);
      setBudgets(data.budgets);
      setGoals(data.goals);
      setAccounts(data.accounts);
    });
    void fetchTrend().then((data) => {
      setTrend(data);
    });
  }, [fetchData, fetchTrend]);

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
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-[160px] text-center">{monthLabel}</span>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" asChild>
          <Link href="/finance/transactions">View Transactions</Link>
        </Button>
      </div>

      {summary && (
        <MonthlySummaryCard
          totalIncome={summary.totalIncome}
          totalExpense={summary.totalExpense}
          net={summary.net}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryPieChart data={summary?.byCategory ?? []} />
        <AccountCard accounts={accounts} />
      </div>

      <TrendLineChart data={trend} />

      <div className="grid gap-6 lg:grid-cols-2">
        <BudgetStatusList budgets={budgets} />
        <SavingsGoalCard goals={goals} />
      </div>
    </div>
  );
}
