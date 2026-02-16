import { FinanceOverview } from "@/components/finance/FinanceOverview";

export default function FinancePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finance Overview</h1>
        <p className="text-sm text-muted-foreground">Track your wallets, income, and expenses</p>
      </div>
      <FinanceOverview />
    </div>
  );
}
