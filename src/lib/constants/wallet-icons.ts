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
  name: string;
  label: string;
  icon: LucideIcon;
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
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6b7280",
  "#1e293b",
];

export function getWalletIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return Wallet;
  return WALLET_ICONS.find((i) => i.name === iconName)?.icon ?? Wallet;
}
