"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationPermission } from "@/components/shared/NotificationPermission";
import { Download, Upload, Lock, Unlock, Shield, FileDown } from "lucide-react";
import { toast } from "sonner";

export function SettingsClient() {
  const [importing, setImporting] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [vaultPassword, setVaultPassword] = React.useState("");
  const [vaultPasswordEnabled, setVaultPasswordEnabled] = React.useState(false);
  const [settingVault, setSettingVault] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const vpHash = data.find(
            (s: { key: string }) => s.key === "vault_password_hash",
          );
          setVaultPasswordEnabled(!!vpHash);
        }
      })
      .catch(() => {});
  }, []);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/backup/export", { method: "POST" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `monolith-backup-${new Date().toISOString().split("T")[0]}.db.gz`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup exported");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/backup/import", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Import failed");
      }
      toast.success("Backup restored. Refreshing...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  async function handleSetVaultPassword() {
    if (!vaultPassword) return;
    setSettingVault(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "vault_password_hash",
          value: vaultPassword,
          action: "set_vault_password",
        }),
      });
      setVaultPasswordEnabled(true);
      setVaultPassword("");
      toast.success("Vault password set");
    } catch {
      toast.error("Failed to set vault password");
    } finally {
      setSettingVault(false);
    }
  }

  async function handleRemoveVaultPassword() {
    setSettingVault(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "vault_password_hash",
          action: "remove",
        }),
      });
      setVaultPasswordEnabled(false);
      toast.success("Vault password removed");
    } catch {
      toast.error("Failed to remove vault password");
    } finally {
      setSettingVault(false);
    }
  }

  async function handleCsvExport(mod: string) {
    try {
      const res = await fetch(`/api/export/csv/${mod}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${mod}-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${mod} CSV exported`);
    } catch {
      toast.error("CSV export failed");
    }
  }

  async function handleJournalExport() {
    try {
      const res = await fetch("/api/export/markdown/journal");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `journal-export-${new Date().toISOString().split("T")[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Journal exported as Markdown");
    } catch {
      toast.error("Journal export failed");
    }
  }

  return (
    <>
      {/* Backup & Restore */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Backup & Restore
          </CardTitle>
          <CardDescription>
            Export your entire database as a compressed backup or restore from a
            previous backup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? "Exporting..." : "Export Backup"}
            </Button>
            <label>
              <Button variant="outline" asChild disabled={importing}>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {importing ? "Importing..." : "Import Backup"}
                </span>
              </Button>
              <input
                type="file"
                accept=".gz"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>
            Export your data as CSV or Markdown files.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCsvExport("habits")}
            >
              Habits CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCsvExport("transactions")}
            >
              Transactions CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleJournalExport}>
              Journal Markdown
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vault Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {vaultPasswordEnabled ? (
              <Lock className="h-5 w-5 text-green-500" />
            ) : (
              <Unlock className="h-5 w-5" />
            )}
            Vault Password
          </CardTitle>
          <CardDescription>
            {vaultPasswordEnabled
              ? "Vault is protected with a master password."
              : "Set a master password to protect your vault."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {vaultPasswordEnabled ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveVaultPassword}
              disabled={settingVault}
            >
              Remove Vault Password
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Set master password"
                value={vaultPassword}
                onChange={(e) => setVaultPassword(e.target.value)}
                className="max-w-xs"
              />
              <Button
                onClick={handleSetVaultPassword}
                disabled={!vaultPassword || settingVault}
              >
                Set Password
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Enable browser notifications for habit reminders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationPermission />
        </CardContent>
      </Card>
    </>
  );
}
