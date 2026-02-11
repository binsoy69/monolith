"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toISODate } from "@/lib/utils/dates";
import { toCents } from "@/lib/utils/currency";
import type { FinanceCategory, FinanceAccount } from "@/lib/services/finance.service";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: FinanceCategory[];
  accounts: FinanceAccount[];
  onSubmit: (data: {
    type: string;
    amount: number;
    description?: string;
    categoryId?: number | null;
    accountId: number;
    toAccountId?: number | null;
    transactionDate: string;
  }) => Promise<void>;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  categories,
  accounts,
  onSubmit,
}: TransactionFormDialogProps) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("none");
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("none");
  const [transactionDate, setTransactionDate] = useState(toISODate(new Date()));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id.toString());
    }
  }, [open, accounts, accountId]);

  const filteredCategories = categories.filter(
    (c) => c.type === type || type === "transfer",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        type,
        amount: toCents(parseFloat(amount) || 0),
        description: description || undefined,
        categoryId: categoryId !== "none" ? parseInt(categoryId) : null,
        accountId: parseInt(accountId),
        toAccountId: toAccountId !== "none" ? parseInt(toAccountId) : null,
        transactionDate,
      });
      onOpenChange(false);
      setAmount("");
      setDescription("");
      setCategoryId("none");
      setToAccountId("none");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">Amount</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was it for?"
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {type === "transfer" && (
            <div>
              <Label className="mb-1.5 block">To Account</Label>
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {accounts
                    .filter((a) => a.id.toString() !== accountId)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {type !== "transfer" && (
            <div>
              <Label className="mb-1.5 block">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="No category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {filteredCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label className="mb-1.5 block">Date</Label>
            <Input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !amount || !accountId}>
              {loading ? "Saving..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
