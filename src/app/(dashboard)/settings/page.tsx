import { getDataDir } from "@/lib/utils/paths";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import path from "path";
import fs from "fs";
import { SettingsClient } from "@/components/shared/SettingsClient";
import { ThemePicker } from "@/components/settings/ThemePicker";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function SettingsPage() {
  const dataDir = getDataDir();
  const projectRoot = process.cwd();
  const portableDbPath = path.join(projectRoot, "monolith.db");
  const isPortable = fs.existsSync(portableDbPath);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Settings
        </h1>
        <p className="text-text-secondary mt-2">
          Manage application configuration and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
          <CardDescription>
            Configure where Monolith stores your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data-dir">Data Directory</Label>
            <Input
              id="data-dir"
              value={dataDir}
              readOnly
              className="bg-bg-secondary text-text-secondary font-mono text-xs"
            />
            <p className="text-xs text-text-secondary">
              Determined by OS default or portable mode.
            </p>
          </div>

          <div className="flex items-center space-x-2 border p-3 rounded-md bg-bg-secondary/50">
            <div
              className={`h-2.5 w-2.5 rounded-full ${isPortable ? "bg-success" : "bg-text-secondary"}`}
            />
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Portable Mode</span>
              <p className="text-xs text-text-secondary">
                {isPortable
                  ? "Active: Using monolith.db in project root."
                  : "Inactive: Using system app data directory."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Choose a theme for the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemePicker />
        </CardContent>
      </Card>

      <SettingsClient />

      <div className="text-center text-xs text-text-secondary pt-8">
        Monolith v0.4.0
      </div>
    </div>
  );
}
