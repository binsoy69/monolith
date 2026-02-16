"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { toCents } from "@/lib/utils/currency";
import { WALLET_COLORS, WALLET_ICONS } from "@/lib/constants/wallet-icons";

interface WalletFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    balance: number;
    icon: string;
    color: string;
  }) => Promise<void>;
  initialData?: {
    id: number;
    name: string;
    icon?: string | null;
    color?: string | null;
  };
}

const DEFAULT_ICON = "wallet";
const DEFAULT_COLOR = WALLET_COLORS[0];

export function WalletFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: WalletFormDialogProps) {
  const isEditMode = !!initialData;
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => (isEditMode ? "Edit Wallet" : "Add Wallet"),
    [isEditMode],
  );

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setName(initialData.name);
      setIcon(initialData.icon ?? DEFAULT_ICON);
      setColor(initialData.color ?? DEFAULT_COLOR);
      setBalance("");
    } else {
      setName("");
      setBalance("");
      setIcon(DEFAULT_ICON);
      setColor(DEFAULT_COLOR);
    }
  }, [open, initialData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        balance: isEditMode ? 0 : toCents(parseFloat(balance) || 0),
        icon,
        color,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="wallet-name" className="mb-1.5 block">Wallet Name</Label>
            <Input
              id="wallet-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. GCash, Cash, Savings"
              required
            />
          </div>

          {!isEditMode && (
            <div>
              <Label htmlFor="wallet-balance" className="mb-1.5 block">Starting Balance</Label>
              <Input
                id="wallet-balance"
                type="number"
                min="0"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
              />
            </div>
          )}

          <div>
            <Label className="mb-2 block">Icon</Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {WALLET_ICONS.map((item) => {
                const Icon = item.icon;
                const selected = icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-md border p-2 text-xs transition-colors",
                      selected ? "border-primary bg-accent" : "border-border hover:bg-accent/60",
                    )}
                    style={selected ? { boxShadow: `inset 0 0 0 1px ${color}` } : undefined}
                  >
                    <Icon className="mb-1 h-4 w-4" style={{ color }} />
                    <span className="text-center leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Color</Label>
            <div className="flex flex-wrap gap-2">
              {WALLET_COLORS.map((c) => {
                const selected = c === color;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-6 w-6 rounded-full border transition-transform hover:scale-105",
                      selected ? "ring-2 ring-offset-2 ring-foreground" : "border-border",
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Saving..." : isEditMode ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
