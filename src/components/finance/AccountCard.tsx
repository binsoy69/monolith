"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import type { FinanceAccount } from "@/lib/services/finance.service";

interface AccountCardProps {
  accounts: FinanceAccount[];
}

export function AccountCard({ accounts }: AccountCardProps) {
  if (accounts.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Accounts</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No accounts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Accounts</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center justify-between">
            <span className="text-sm font-medium">{account.name}</span>
            <span className={`text-sm font-medium tabular-nums ${account.balance >= 0 ? "text-success" : "text-destructive"}`}>
              {formatCurrency(account.balance, account.currency)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
