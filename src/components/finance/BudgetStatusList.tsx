"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import type { BudgetWithSpent } from "@/lib/services/finance.service";

interface BudgetStatusListProps {
  budgets: BudgetWithSpent[];
}

export function BudgetStatusList({ budgets }: BudgetStatusListProps) {
  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Budgets</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No budgets set</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Budgets</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((budget) => {
          const percent = budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;
          const colorClass =
            percent > 90
              ? "[&>div]:bg-destructive"
              : percent > 75
                ? "[&>div]:bg-yellow-500"
                : "[&>div]:bg-success";

          return (
            <div key={budget.id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">{budget.categoryName}</span>
                <span className="text-muted-foreground">
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                  <span className="ml-1">({Math.round(percent)}%)</span>
                </span>
              </div>
              <Progress value={percent} className={`h-2 ${colorClass}`} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
