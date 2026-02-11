import { TransactionList } from "@/components/finance/TransactionList";

export default function TransactionsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-sm text-muted-foreground">View and manage your transactions</p>
      </div>
      <TransactionList />
    </div>
  );
}
