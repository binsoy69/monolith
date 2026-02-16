"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MonthlySummaryCardProps {
  totalIncome: number;
  totalExpense: number;
  net: number;
  prevIncome?: number;
  prevExpense?: number;
}

function TrendBadge({ current, previous }: { current: number; previous?: number }) {
  if (previous === undefined || previous === 0) return null;
  const pctChange = ((current - previous) / previous) * 100;
  const isUp = pctChange >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium rounded-full px-1.5 py-0.5 ${
      isUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
    }`}>
      {isUp ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
      {Math.abs(pctChange).toFixed(0)}%
    </span>
  );
}

export function MonthlySummaryCard({ totalIncome, totalExpense, net, prevIncome, prevExpense }: MonthlySummaryCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Income */}
      <Card className="border-l-4 border-l-success">
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Income</span>
            <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalIncome)}</p>
          <div className="mt-1">
            <TrendBadge current={totalIncome} previous={prevIncome} />
          </div>
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card className="border-l-4 border-l-destructive">
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Expenses</span>
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalExpense)}</p>
          <div className="mt-1">
            <TrendBadge current={totalExpense} previous={prevExpense} />
          </div>
        </CardContent>
      </Card>

      {/* Net */}
      <Card className="border-l-4 border-l-accent">
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Net {net >= 0 ? "Surplus" : "Deficit"}
            </span>
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-accent" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${net >= 0 ? "text-success" : "text-destructive"}`}>
            {net < 0 ? "-" : ""}{formatCurrency(Math.abs(net))}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
