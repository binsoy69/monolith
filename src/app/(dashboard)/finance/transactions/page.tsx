import { TransactionList } from "@/components/finance/TransactionList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TransactionsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
          <Link href="/finance">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Finance
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-sm text-muted-foreground">View and manage your transactions</p>
      </div>
      <TransactionList />
    </div>
  );
}
