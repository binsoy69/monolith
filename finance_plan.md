# Finance Module Overhaul Plan

## Summary of Changes

Restructure the finance page to be wallet-centric with meaningful, fully-functional sections. Add wallet management (CRUD), total balance card, category management, back navigation on transactions page, and remove non-functional sections (Budgets, Savings Goals).

---

## Decisions Made

| Decision | Choice |
|---|---|
| Wallet fields | Name + Starting Balance + Predefined Icon + Color |
| Total balance card | Grand total with mini wallet breakdown list |
| Budgets & Savings Goals | **Remove both** (no management UI, not functional) |
| Page layout | Wallets first, then analytics below |
| Wallet CRUD | Full create / edit / delete |
| Bottom section | Trend chart + Recent transactions (2-column) |
| Categories | Add full category management UI |
| Icon style | Predefined curated set (~10-15 wallet-relevant icons) |

---

## New Page Layout (Top to Bottom)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Month Navigator          [Manage Categories] [View Transactions â†’] â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                     â”‚
â”‚  â”Œâ”€ Total Balance Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚  ðŸ’° Total Balance: â‚±XX,XXX.XX                 â”‚  â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”‚  â”‚
â”‚  â”‚  â”‚ Gcash   â”‚ â”‚ Cash    â”‚ â”‚ Savings â”‚ [+ Add]  â”‚  â”‚
â”‚  â”‚  â”‚ â‚±5,000  â”‚ â”‚ â‚±2,000  â”‚ â”‚ â‚±10,000â”‚         â”‚  â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                     â”‚
â”‚  â”Œâ”€ Monthly Summary (3 cards) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ [Income â‚±XX] [Expenses â‚±XX] [Net Â±â‚±XX]       â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                     â”‚
â”‚  â”Œâ”€ 2-Column Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Category Pie Chart    â”‚  Trend Line Chart      â”‚  â”‚
â”‚  â”‚ (expense breakdown)   â”‚  (6-month trend)       â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                     â”‚
â”‚  â”Œâ”€ Recent Transactions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Last 5 transactions with "View All â†’" link     â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Task Breakdown

### Task 1: Update Database Schema â€” Add `icon` and `color` fields to `finance_accounts` ✅ Done

**File:** `src/lib/db/schema.ts`

**What to do:**
- Add `icon` field (TEXT, nullable) to the `financeAccounts` table â€” stores the predefined icon name (e.g., `"smartphone"`, `"piggy-bank"`, `"wallet"`)
- Add `color` field (TEXT, nullable, default `"#6366f1"`) to the `financeAccounts` table â€” stores hex color for the wallet

**Change the table definition from:**
```ts
export const financeAccounts = sqliteTable("finance_accounts", {
  id: pk,
  name: text("name").notNull(),
  balance: integer("balance").notNull().default(0),
  currency: text("currency").default("PHP").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});
```

**To:**
```ts
export const financeAccounts = sqliteTable("finance_accounts", {
  id: pk,
  name: text("name").notNull(),
  balance: integer("balance").notNull().default(0),
  currency: text("currency").default("PHP").notNull(),
  icon: text("icon"),           // lucide icon name (e.g., "smartphone", "wallet")
  color: text("color"),         // hex color (e.g., "#6366f1")
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});
```

**After editing the schema, run the migration:**
```bash
npx drizzle-kit push
```

---

### Task 2: Update Finance Service â€” Add `updateAccount` method and update `createAccount` ✅ Done

**File:** `src/lib/services/finance.service.ts`

**2a. Update `createAccount` method to accept `icon` and `color`:**

Change the `createAccount` method signature and implementation:
```ts
async createAccount(data: {
  name: string;
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
}): Promise<FinanceAccount> {
  const result = await db
    .insert(financeAccounts)
    .values({
      name: data.name,
      balance: data.balance ?? 0,
      currency: data.currency ?? "PHP",
      icon: data.icon,
      color: data.color,
    })
    .returning();
  return result[0];
},
```

**2b. Add a new `updateAccount` method** (currently missing â€” only `updateAccountBalance` exists):

Add this method after `deleteAccount`:
```ts
async updateAccount(
  id: number,
  data: Partial<{ name: string; icon: string; color: string }>
): Promise<void> {
  await db
    .update(financeAccounts)
    .set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(financeAccounts.id, id));
},
```

**2c. Update `deleteAccount` to handle associated transactions:**

The current `deleteAccount` just deletes the account with no safety. Update to also delete associated transactions (or reassign them). Since we want full CRUD with confirmation, the simplest approach:

```ts
async deleteAccount(id: number): Promise<void> {
  // Delete all transactions associated with this account
  await db.delete(transactions).where(eq(transactions.accountId, id));
  // Also clean up any transfers TO this account
  await db.delete(transactions).where(eq(transactions.toAccountId, id));
  // Delete the account
  await db.delete(financeAccounts).where(eq(financeAccounts.id, id));
},
```

**2d. Add `getRecentTransactions` method for the new "Recent Transactions" section:**

```ts
async getRecentTransactions(limit: number = 5): Promise<Transaction[]> {
  return db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.transactionDate), desc(transactions.id))
    .limit(limit);
},
```

**2e. Add `updateCategory` and `deleteCategory` methods for category management:**

The service already has `deleteCategory`. Add `updateCategory`:
```ts
async updateCategory(
  id: number,
  data: Partial<{ name: string; type: "income" | "expense"; color: string; icon: string }>
): Promise<void> {
  await db
    .update(financeCategories)
    .set(data)
    .where(eq(financeCategories.id, id));
},
```

---

### Task 3: Update API Routes â€” Add PUT/DELETE for accounts and categories ✅ Done

**3a. Create `src/app/api/finance/accounts/[id]/route.ts`** (new file):

```ts
import { NextResponse } from "next/server";
import { financeService } from "@/lib/services/finance.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, icon, color } = body;
    await financeService.updateAccount(parseInt(id), { name, icon, color });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update account:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await financeService.deleteAccount(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete account:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

**3b. Create `src/app/api/finance/categories/[id]/route.ts`** (new file):

```ts
import { NextResponse } from "next/server";
import { financeService } from "@/lib/services/finance.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, color, icon } = body;
    await financeService.updateCategory(parseInt(id), { name, type, color, icon });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await financeService.deleteCategory(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

**3c. Add `GET /api/finance/transactions/recent` route** (new file: `src/app/api/finance/transactions/recent/route.ts`):

```ts
import { NextResponse } from "next/server";
import { financeService } from "@/lib/services/finance.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const recent = await financeService.getRecentTransactions(5);
    return NextResponse.json(recent);
  } catch (error) {
    console.error("Failed to get recent transactions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

**3d. Update `src/app/api/finance/accounts/route.ts` POST handler to accept `icon` and `color`:**

Update the POST handler body destructuring:
```ts
const { name, balance, currency, icon, color } = body;
```
And pass them to createAccount:
```ts
const account = await financeService.createAccount({
  name: name.trim(),
  balance,
  currency,
  icon,
  color,
});
```

---

### Task 4: Create Wallet Icon Constants File ✅ Done

**Create new file:** `src/lib/constants/wallet-icons.ts`

This file defines the curated set of predefined wallet icons that users can choose from when creating/editing a wallet:

```ts
import {
  Wallet,
  Smartphone,
  PiggyBank,
  Landmark,
  CreditCard,
  Banknote,
  CircleDollarSign,
  HandCoins,
  Coins,
  ShieldCheck,
  Briefcase,
  TrendingUp,
  Gift,
  type LucideIcon,
} from "lucide-react";

export interface WalletIconOption {
  name: string;       // lucide icon name stored in DB
  label: string;      // human-readable label
  icon: LucideIcon;   // React component
}

export const WALLET_ICONS: WalletIconOption[] = [
  { name: "wallet", label: "Wallet", icon: Wallet },
  { name: "smartphone", label: "E-Wallet", icon: Smartphone },
  { name: "piggy-bank", label: "Savings", icon: PiggyBank },
  { name: "landmark", label: "Bank", icon: Landmark },
  { name: "credit-card", label: "Credit Card", icon: CreditCard },
  { name: "banknote", label: "Cash", icon: Banknote },
  { name: "circle-dollar-sign", label: "Investment", icon: CircleDollarSign },
  { name: "hand-coins", label: "Allowance", icon: HandCoins },
  { name: "coins", label: "Coins", icon: Coins },
  { name: "shield-check", label: "Emergency", icon: ShieldCheck },
  { name: "briefcase", label: "Business", icon: Briefcase },
  { name: "trending-up", label: "Stocks", icon: TrendingUp },
  { name: "gift", label: "Gift Fund", icon: Gift },
];

export const WALLET_COLORS: string[] = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6b7280", // gray
  "#1e293b", // slate
];

/**
 * Helper to get the LucideIcon component from a stored icon name string.
 * Returns the Wallet icon as fallback.
 */
export function getWalletIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return Wallet;
  return WALLET_ICONS.find((i) => i.name === iconName)?.icon ?? Wallet;
}
```

---

### Task 5: Create `WalletFormDialog` Component (New File) ✅ Done

**Create new file:** `src/components/finance/WalletFormDialog.tsx`

A dialog for creating and editing wallets. Props:

```ts
interface WalletFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    balance: number;    // in cents
    icon: string;
    color: string;
  }) => Promise<void>;
  initialData?: {       // if provided, we're in "edit" mode
    id: number;
    name: string;
    icon?: string | null;
    color?: string | null;
  };
}
```

**UI layout of the dialog:**

```
â”Œâ”€ Add Wallet / Edit Wallet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                               â”‚
â”‚  Wallet Name: [____________]                  â”‚
â”‚                                               â”‚
â”‚  Starting Balance: [____________]             â”‚
â”‚  (only shown in create mode, not edit mode)   â”‚
â”‚                                               â”‚
â”‚  Icon:                                        â”‚
â”‚  [ðŸ”²wallet] [ðŸ“±e-wallet] [ðŸ·savings] ...    â”‚
â”‚  (grid of clickable icon buttons,             â”‚
â”‚   selected one is highlighted)                â”‚
â”‚                                               â”‚
â”‚  Color:                                       â”‚
â”‚  [â¬¤][â¬¤][â¬¤][â¬¤][â¬¤][â¬¤][â¬¤][â¬¤][â¬¤][â¬¤]  â”‚
â”‚  (row of color circles, selected highlighted) â”‚
â”‚                                               â”‚
â”‚              [Cancel]  [Create / Save]        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Implementation details:**
- Use `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` from shadcn/ui
- `Input` for wallet name and balance
- Import `WALLET_ICONS` and `WALLET_COLORS` from `src/lib/constants/wallet-icons.ts`
- Render icons as a grid of `button` elements, each showing the Lucide icon with its label below. The selected icon gets a ring/highlight border using the selected color
- Render colors as a row of circular `button` elements (16x16 or 20x20 colored circles). Selected one gets a ring border
- In edit mode: hide the balance field (balance is managed through transactions), pre-fill name/icon/color from `initialData`
- In create mode: show balance field, default icon to "wallet", default color to first color
- On submit: call `onSubmit` with the data, then close dialog and reset form
- Use `toCents()` from `@/lib/utils/currency` to convert balance input to cents

---

### Task 6: Create `WalletCard` Component â€” Replace `AccountCard` (New File) ✅ Done

**Create new file:** `src/components/finance/WalletCard.tsx`

This replaces the existing `AccountCard.tsx`. It shows the total balance prominently, with a mini-list of each wallet below, and an "Add Wallet" button.

**Props:**
```ts
interface WalletCardProps {
  accounts: FinanceAccount[];
  onAddWallet: () => void;
  onEditWallet: (account: FinanceAccount) => void;
  onDeleteWallet: (account: FinanceAccount) => void;
}
```

**UI layout:**
```
â”Œâ”€ My Wallets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ [+ Add] â”€â”
â”‚                                                â”‚
â”‚  Total Balance                                 â”‚
â”‚  â‚±17,000.00                (large, bold)      â”‚
â”‚                                                â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚ ðŸ“± Gcash              â‚±5,000.00  [â‹¯] â”‚    â”‚
â”‚  â”‚ ðŸ’µ Cash               â‚±2,000.00  [â‹¯] â”‚    â”‚
â”‚  â”‚ ðŸ· Savings           â‚±10,000.00  [â‹¯] â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Implementation details:**
- `Card` with `CardHeader` containing title "My Wallets" and a "+" `Button` (ghost/outline, small) that calls `onAddWallet`
- Total balance = `accounts.reduce((sum, a) => sum + a.balance, 0)`. Display using `formatCurrency()`. Use large text (`text-3xl font-bold`). Color: green if positive, red if negative
- Below total: a list of each wallet, each row showing:
  - The wallet's icon (use `getWalletIcon(account.icon)` from constants file) rendered with the wallet's `color`
  - The wallet name
  - The wallet balance (formatted, color-coded)
  - A `DropdownMenu` (three dots `MoreHorizontal` icon) with "Edit" and "Delete" options
- If no accounts: show empty state with "Add your first wallet" text and an add button
- Use `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger` from shadcn/ui
- Delete option should be styled with `text-destructive`

---

### Task 7: Create `CategoryManagerDialog` Component (New File) ✅ Done

**Create new file:** `src/components/finance/CategoryManagerDialog.tsx`

A dialog that lists all categories and allows creating, editing, and deleting them.

**Props:**
```ts
interface CategoryManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriesChanged: () => void;  // callback to refresh parent data
}
```

**UI layout:**
```
â”Œâ”€ Manage Categories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                                   â”‚
â”‚  [Income â–¾] [Expense â–¾]    (tab/toggle filter)   â”‚
â”‚                                                   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚ ðŸ”´ Food & Dining               [âœï¸] [ðŸ—‘ï¸] â”‚    â”‚
â”‚  â”‚ ðŸŸ  Transportation               [âœï¸] [ðŸ—‘ï¸] â”‚    â”‚
â”‚  â”‚ ðŸŸ¢ Salary                       [âœï¸] [ðŸ—‘ï¸] â”‚    â”‚
â”‚  â”‚ ...                                       â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                   â”‚
â”‚  â”€â”€ Add New Category â”€â”€                           â”‚
â”‚  Name: [____________]                             â”‚
â”‚  Type: [Income â–¾ / Expense â–¾]                     â”‚
â”‚  Color: [â¬¤][â¬¤][â¬¤][â¬¤][â¬¤]                     â”‚
â”‚                            [Add Category]         â”‚
â”‚                                                   â”‚
â”‚                                    [Close]        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Implementation details:**
- Fetch categories from `/api/finance/categories` on open
- Display a filterable list (toggle between "All", "Income", "Expense")
- Each category row shows: a color dot, category name, type badge, edit (pencil) and delete (trash) icon buttons
- Edit: inline edit or small sub-form that pre-fills name/type/color, with a save button
- Delete: show a confirmation alert (use `AlertDialog` from shadcn) before deleting. Warn that transactions using this category won't be categorized anymore
- Add form at the bottom: text input for name, select for type (income/expense), color picker (same style as wallet â€” row of colored circles)
- On any change (create/edit/delete): call `onCategoriesChanged()` so parent can re-fetch
- API calls:
  - `GET /api/finance/categories` â€” fetch list
  - `POST /api/finance/categories` â€” create `{ name, type, color }`
  - `PUT /api/finance/categories/[id]` â€” update `{ name, type, color }`
  - `DELETE /api/finance/categories/[id]` â€” delete

---

### Task 8: Create `RecentTransactions` Component (New File) ✅ Done

**Create new file:** `src/components/finance/RecentTransactions.tsx`

Shows the 5 most recent transactions with a "View All" link.

**Props:**
```ts
interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: FinanceCategory[];
}
```

**UI layout:**
```
â”Œâ”€ Recent Transactions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ [View All â†’] â”€â”
â”‚                                                  â”‚
â”‚  Grocery shopping          -â‚±500.00   Feb 15    â”‚
â”‚  Salary                   +â‚±25,000.00  Feb 1    â”‚
â”‚  Electric bill             -â‚±2,500.00  Feb 1    â”‚
â”‚  Gcash â†’ Savings (transfer)  â‚±5,000   Jan 30    â”‚
â”‚  Coffee                     -â‚±180.00  Jan 30    â”‚
â”‚                                                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Implementation details:**
- `Card` with `CardHeader` containing title "Recent Transactions" and a `Link` to `/finance/transactions` styled as a small button/text link saying "View All"
- Reuse the existing `TransactionRow` component for each transaction
- Build a `categoryMap` from the `categories` prop to pass `categoryName` to `TransactionRow`
- If no transactions: show "No transactions yet" empty state
- This component is presentational only â€” data is fetched by parent (`FinanceOverview`)

---

### Task 9: Create Delete Confirmation Dialog (New File) ✅ Done

**Create new file:** `src/components/finance/DeleteConfirmDialog.tsx`

A reusable confirmation dialog for dangerous actions (delete wallet, delete category).

**Props:**
```ts
interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;          // e.g., "Delete Wallet"
  description: string;    // e.g., "This will permanently delete the wallet 'Gcash' and all its transactions."
  onConfirm: () => Promise<void>;
}
```

**Implementation details:**
- Use `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction` from shadcn/ui
- The confirm button should be `variant="destructive"`
- Show loading state while `onConfirm` is executing
- Close dialog after confirmation completes

---

### Task 10: Rewrite `FinanceOverview` Component â€” New Layout ✅ Done

**File:** `src/components/finance/FinanceOverview.tsx`

This is the main orchestrator. Rewrite it to match the new layout.

**Changes:**

**10a. Update imports:**
- Remove imports: `BudgetStatusList`, `SavingsGoalCard`, `AccountCard`, and types `BudgetWithSpent`, `SavingsGoal`
- Add imports: `WalletCard`, `WalletFormDialog`, `CategoryManagerDialog`, `RecentTransactions`, `DeleteConfirmDialog`
- Add import for `FinanceCategory` type

**10b. Update state:**
- Remove: `budgets`, `goals` state variables
- Add:
  ```ts
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<FinanceAccount | null>(null);
  const [deletingWallet, setDeletingWallet] = useState<FinanceAccount | null>(null);
  ```

**10c. Update `fetchData`:**
- Remove fetches for `/api/finance/budgets` and `/api/finance/goals`
- Add fetches for `/api/finance/transactions/recent` and `/api/finance/categories`
- Update return type and state setters accordingly

```ts
const [summaryRes, prevSummaryRes, accountsRes, recentRes, categoriesRes] = await Promise.all([
  fetch(`/api/finance/summary?year=${year}&month=${month}`),
  fetch(`/api/finance/summary?year=${prevY}&month=${prevM}`),
  fetch("/api/finance/accounts"),
  fetch("/api/finance/transactions/recent"),
  fetch("/api/finance/categories"),
]);
```

**10d. Add handler functions:**
```ts
async function handleCreateWallet(data: { name: string; balance: number; icon: string; color: string }) {
  const res = await fetch("/api/finance/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error();
  toast.success("Wallet created");
  refreshData();
}

async function handleEditWallet(data: { name: string; icon: string; color: string }) {
  if (!editingWallet) return;
  const res = await fetch(`/api/finance/accounts/${editingWallet.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error();
  toast.success("Wallet updated");
  setEditingWallet(null);
  refreshData();
}

async function handleDeleteWallet() {
  if (!deletingWallet) return;
  const res = await fetch(`/api/finance/accounts/${deletingWallet.id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error();
  toast.success("Wallet deleted");
  setDeletingWallet(null);
  refreshData();
}

function refreshData() {
  // Re-trigger fetchData and fetchTrend
  void fetchData().then((data) => { ... });
  void fetchTrend().then((data) => setTrend(data));
}
```

**10e. Update JSX layout â€” new structure (top to bottom):**

```tsx
<div className="space-y-6">
  {/* Top bar: Month navigation + action buttons */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      {/* Month prev/next buttons â€” same as current */}
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setCategoryDialogOpen(true)}>
        Manage Categories
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link href="/finance/transactions">View Transactions</Link>
      </Button>
    </div>
  </div>

  {/* Section 1: Wallet Card (total balance + wallet list) */}
  <WalletCard
    accounts={accounts}
    onAddWallet={() => setWalletDialogOpen(true)}
    onEditWallet={(account) => setEditingWallet(account)}
    onDeleteWallet={(account) => setDeletingWallet(account)}
  />

  {/* Section 2: Monthly Summary (Income / Expense / Net) */}
  {summary && (
    <MonthlySummaryCard ... />
  )}

  {/* Section 3: Charts (2-column grid) */}
  <div className="grid gap-6 lg:grid-cols-2">
    <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
      <CategoryPieChart data={summary?.byCategory ?? []} />
    </Suspense>
    <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
      <TrendLineChart data={trend} />
    </Suspense>
  </div>

  {/* Section 4: Recent Transactions */}
  <RecentTransactions transactions={recentTxns} categories={categories} />

  {/* Dialogs */}
  <WalletFormDialog
    open={walletDialogOpen}
    onOpenChange={setWalletDialogOpen}
    onSubmit={handleCreateWallet}
  />
  <WalletFormDialog
    open={!!editingWallet}
    onOpenChange={(open) => { if (!open) setEditingWallet(null); }}
    onSubmit={handleEditWallet}
    initialData={editingWallet ? {
      id: editingWallet.id,
      name: editingWallet.name,
      icon: editingWallet.icon,
      color: editingWallet.color,
    } : undefined}
  />
  <DeleteConfirmDialog
    open={!!deletingWallet}
    onOpenChange={(open) => { if (!open) setDeletingWallet(null); }}
    title="Delete Wallet"
    description={`This will permanently delete "${deletingWallet?.name}" and all its transactions. This action cannot be undone.`}
    onConfirm={handleDeleteWallet}
  />
  <CategoryManagerDialog
    open={categoryDialogOpen}
    onOpenChange={setCategoryDialogOpen}
    onCategoriesChanged={refreshData}
  />
</div>
```

---

### Task 11: Fix Transactions Page â€” Add Back Button ✅ Done

**File:** `src/app/(dashboard)/finance/transactions/page.tsx`

**Current code:**
```tsx
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
```

**New code:**
```tsx
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
```

---

### Task 12: Remove Unused Components and Clean Up ✅ Done

**12a. Delete these files** (no longer used since Budgets and Savings Goals are removed):
- `src/components/finance/BudgetStatusList.tsx`
- `src/components/finance/SavingsGoalCard.tsx`
- `src/components/finance/AccountCard.tsx` (replaced by `WalletCard`)

**12b. Remove unused API fetches from `FinanceOverview.tsx`:**
- Remove the fetch calls to `/api/finance/budgets` and `/api/finance/goals`
- Remove the `budgets` and `goals` state variables and their setters

**12c. Optionally keep the API routes** (`/api/finance/budgets`, `/api/finance/goals`) and DB tables intact â€” they are backend-only and don't hurt. This preserves the option to re-add them later. Do NOT delete the schema tables or service methods.

---

### Task 13: Update Finance Page Subtitle ✅ Done

**File:** `src/app/(dashboard)/finance/page.tsx`

Change the subtitle from:
```tsx
<p className="text-sm text-muted-foreground">Track your income, expenses, and savings</p>
```
To:
```tsx
<p className="text-sm text-muted-foreground">Track your wallets, income, and expenses</p>
```

---

## File Summary

### New Files to Create (7)
| # | File Path | Purpose |
|---|-----------|---------|
| 1 | `src/lib/constants/wallet-icons.ts` | Predefined wallet icon/color constants |
| 2 | `src/components/finance/WalletFormDialog.tsx` | Create/edit wallet dialog |
| 3 | `src/components/finance/WalletCard.tsx` | Total balance + wallet list card |
| 4 | `src/components/finance/CategoryManagerDialog.tsx` | Category CRUD dialog |
| 5 | `src/components/finance/RecentTransactions.tsx` | Last 5 transactions card |
| 6 | `src/components/finance/DeleteConfirmDialog.tsx` | Reusable delete confirmation |
| 7 | `src/app/api/finance/accounts/[id]/route.ts` | PUT/DELETE account endpoints |
| 8 | `src/app/api/finance/categories/[id]/route.ts` | PUT/DELETE category endpoints |
| 9 | `src/app/api/finance/transactions/recent/route.ts` | GET recent transactions endpoint |

### Files to Modify (5)
| # | File Path | Changes |
|---|-----------|---------|
| 1 | `src/lib/db/schema.ts` | Add `icon` and `color` fields to `financeAccounts` |
| 2 | `src/lib/services/finance.service.ts` | Add `updateAccount`, `updateCategory`, `getRecentTransactions`; update `createAccount`, `deleteAccount` |
| 3 | `src/app/api/finance/accounts/route.ts` | Update POST to accept `icon` and `color` |
| 4 | `src/components/finance/FinanceOverview.tsx` | Complete rewrite of layout and data flow |
| 5 | `src/app/(dashboard)/finance/transactions/page.tsx` | Add back button |
| 6 | `src/app/(dashboard)/finance/page.tsx` | Update subtitle text |

### Files to Delete (3)
| # | File Path | Reason |
|---|-----------|--------|
| 1 | `src/components/finance/BudgetStatusList.tsx` | Budgets section removed |
| 2 | `src/components/finance/SavingsGoalCard.tsx` | Savings goals section removed |
| 3 | `src/components/finance/AccountCard.tsx` | Replaced by `WalletCard` |

---

## Execution Order

Execute tasks in this exact order to avoid broken imports/dependencies:

1. **Task 1** â€” Schema migration (icon/color fields)
2. **Task 2** â€” Service layer updates (new methods)
3. **Task 3** â€” API route updates and new routes
4. **Task 4** â€” Wallet icon constants
5. **Task 5** â€” WalletFormDialog component
6. **Task 6** â€” WalletCard component
7. **Task 7** â€” CategoryManagerDialog component
8. **Task 8** â€” RecentTransactions component
9. **Task 9** â€” DeleteConfirmDialog component
10. **Task 10** â€” Rewrite FinanceOverview (main orchestrator)
11. **Task 11** â€” Fix transactions page back button
12. **Task 12** â€” Delete unused files
13. **Task 13** â€” Update page subtitle

---

## Post-Implementation Checklist

- [ ] Run `npx drizzle-kit push` to apply schema migration
- [ ] Run `npm run build` to verify no TypeScript errors
- [ ] Test: Create a new wallet with name, icon, color, and starting balance
- [ ] Test: Edit wallet name/icon/color
- [ ] Test: Delete a wallet (verify confirmation dialog and transaction cleanup)
- [ ] Test: Total balance card shows correct sum of all wallets
- [ ] Test: Add/edit/delete categories in the category manager
- [ ] Test: Category pie chart still works with updated data flow
- [ ] Test: Recent transactions card shows last 5 transactions
- [ ] Test: "View All" link navigates to transactions page
- [ ] Test: Back button on transactions page navigates to `/finance`
- [ ] Test: Creating a transaction updates wallet balance in real-time
- [ ] Test: Month navigation still works correctly
- [ ] Test: Empty states display correctly when no wallets/transactions exist














