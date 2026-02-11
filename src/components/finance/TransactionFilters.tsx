"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { FinanceCategory, FinanceAccount } from "@/lib/services/finance.service";

interface TransactionFiltersProps {
  type: string;
  categoryId: string;
  accountId: string;
  startDate: string;
  endDate: string;
  categories: FinanceCategory[];
  accounts: FinanceAccount[];
  onTypeChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onAccountChange: (v: string) => void;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
}

export function TransactionFilters({
  type, categoryId, accountId, startDate, endDate,
  categories, accounts,
  onTypeChange, onCategoryChange, onAccountChange,
  onStartDateChange, onEndDateChange,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
          <SelectItem value="transfer">Transfer</SelectItem>
        </SelectContent>
      </Select>

      <Select value={categoryId} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id.toString()}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={accountId} onValueChange={onAccountChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All accounts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All accounts</SelectItem>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id.toString()}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="w-[150px]"
        placeholder="Start date"
      />
      <Input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="w-[150px]"
        placeholder="End date"
      />
    </div>
  );
}
