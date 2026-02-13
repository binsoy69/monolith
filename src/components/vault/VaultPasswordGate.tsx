"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

interface VaultPasswordGateProps {
  children: React.ReactNode;
  enabled: boolean;
}

const SESSION_KEY = "monolith_vault_unlocked";

export function VaultPasswordGate({
  children,
  enabled,
}: VaultPasswordGateProps) {
  const [unlocked, setUnlocked] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) {
      setUnlocked(true);
      return;
    }
    // Check session
    if (sessionStorage.getItem(SESSION_KEY) === "true") {
      setUnlocked(true);
    }
  }, [enabled]);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/settings");
      const settings = await res.json();
      const vaultPasswordHash = settings.find?.(
        (s: { key: string }) => s.key === "vault_password_hash",
      )?.value;

      if (!vaultPasswordHash) {
        // No password set, just unlock
        setUnlocked(true);
        sessionStorage.setItem(SESSION_KEY, "true");
        return;
      }

      // Verify via API
      const verifyRes = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_vault_password",
          password,
        }),
      });

      if (verifyRes.ok) {
        setUnlocked(true);
        sessionStorage.setItem(SESSION_KEY, "true");
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("Failed to verify password");
    } finally {
      setLoading(false);
    }
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Vault Locked</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your master password to access the vault
          </p>
        </div>
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vault-password" className="sr-only">
              Password
            </Label>
            <Input
              id="vault-password"
              type="password"
              placeholder="Master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !password}
          >
            {loading ? "Verifying..." : "Unlock"}
          </Button>
        </form>
      </div>
    </div>
  );
}
