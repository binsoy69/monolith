"use client";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/dates";
import { formatCurrency } from "@/lib/utils/currency";
import type { Transaction } from "@/lib/services/finance.service";

interface TransactionRowProps {
  transaction: Transaction;
  categoryName?: string;
}

const TYPE_COLORS: Record<string, string> = {
  income: "text-success",
  expense: "text-destructive",
  transfer: "text-accent",
};

export function TransactionRow({ transaction, categoryName }: TransactionRowProps) {
  const prefix = transaction.type === "income" ? "+" : "-";

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">
            {transaction.description || "Untitled"}
          </p>
          <Badge variant="outline" className="text-xs shrink-0">
            {transaction.type}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground">
            {formatDate(transaction.transactionDate)}
          </p>
          {categoryName && (
            <span className="text-xs text-muted-foreground">· {categoryName}</span>
          )}
        </div>
      </div>
      <span className={`font-medium tabular-nums shrink-0 ml-4 ${TYPE_COLORS[transaction.type]}`}>
        {prefix}{formatCurrency(transaction.amount)}
      </span>
    </div>
  );
}
