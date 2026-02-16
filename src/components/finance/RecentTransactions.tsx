"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionRow } from "@/components/finance/TransactionRow";
import type { FinanceCategory, Transaction } from "@/lib/services/finance.service";

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: FinanceCategory[];
}

export function RecentTransactions({
  transactions,
  categories,
}: RecentTransactionsProps) {
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/finance/transactions">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet</p>
        ) : (
          transactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              categoryName={transaction.categoryId ? categoryMap.get(transaction.categoryId) : undefined}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
