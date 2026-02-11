"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import type { SavingsGoal } from "@/lib/services/finance.service";

interface SavingsGoalCardProps {
  goals: SavingsGoal[];
}

export function SavingsGoalCard({ goals }: SavingsGoalCardProps) {
  if (goals.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Savings Goals</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No savings goals</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Savings Goals</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const current = goal.current ?? 0;
          const percent = goal.target > 0 ? Math.min((current / goal.target) * 100, 100) : 0;
          return (
            <div key={goal.id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">{goal.name}</span>
                <span className="text-muted-foreground">
                  {formatCurrency(current)} / {formatCurrency(goal.target)}
                  <span className="ml-1">({Math.round(percent)}%)</span>
                </span>
              </div>
              <Progress value={percent} className="h-2" />
              {goal.deadline && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Deadline: {goal.deadline}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
