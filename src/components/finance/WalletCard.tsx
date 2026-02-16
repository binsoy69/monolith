"use client";

import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils/currency";
import { getWalletIcon } from "@/lib/constants/wallet-icons";
import type { FinanceAccount } from "@/lib/services/finance.service";

interface WalletCardProps {
  accounts: FinanceAccount[];
  onAddWallet: () => void;
  onEditWallet: (account: FinanceAccount) => void;
  onDeleteWallet: (account: FinanceAccount) => void;
}

export function WalletCard({
  accounts,
  onAddWallet,
  onEditWallet,
  onDeleteWallet,
}: WalletCardProps) {
  const total = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">My Wallets</CardTitle>
        <Button variant="outline" size="sm" onClick={onAddWallet}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <p className={`text-3xl font-bold ${total >= 0 ? "text-success" : "text-destructive"}`}>
            {total < 0 ? "-" : ""}
            {formatCurrency(Math.abs(total))}
          </p>
        </div>

        {accounts.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center">
            <p className="mb-3 text-sm text-muted-foreground">Add your first wallet</p>
            <Button size="sm" onClick={onAddWallet}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {accounts.map((account) => {
              const Icon = getWalletIcon(account.icon);
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: account.color ?? "currentColor" }}
                    />
                    <span className="truncate text-sm font-medium">{account.name}</span>
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    <span
                      className={`text-sm font-medium tabular-nums ${account.balance >= 0 ? "text-success" : "text-destructive"}`}
                    >
                      {account.balance < 0 ? "-" : ""}
                      {formatCurrency(Math.abs(account.balance), account.currency)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open wallet actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditWallet(account)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteWallet(account)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
