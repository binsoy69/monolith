"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface MonthlySummaryCardProps {
  totalIncome: number;
  totalExpense: number;
  net: number;
}

export function MonthlySummaryCard({ totalIncome, totalExpense, net }: MonthlySummaryCardProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6 text-center">
          <TrendingUp className="h-5 w-5 mx-auto text-success mb-1" />
          <p className="text-lg font-bold text-success">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-muted-foreground">Income</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <TrendingDown className="h-5 w-5 mx-auto text-destructive mb-1" />
          <p className="text-lg font-bold text-destructive">{formatCurrency(totalExpense)}</p>
          <p className="text-xs text-muted-foreground">Expenses</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <Wallet className="h-5 w-5 mx-auto text-accent mb-1" />
          <p className={`text-lg font-bold ${net >= 0 ? "text-success" : "text-destructive"}`}>
            {formatCurrency(Math.abs(net))}
          </p>
          <p className="text-xs text-muted-foreground">Net {net >= 0 ? "Surplus" : "Deficit"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
