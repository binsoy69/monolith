"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Check } from "lucide-react";
import {
  requestNotificationPermission,
  getNotificationPermission,
  scheduleAllReminders,
  showNotification,
} from "@/lib/utils/notifications";
import { toast } from "sonner";

export function NotificationPermission() {
  const [permission, setPermission] = React.useState<string>("default");
  const [habitsLoaded, setHabitsLoaded] = React.useState(false);

  React.useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  React.useEffect(() => {
    if (permission !== "granted" || habitsLoaded) return;

    // Load habits and schedule reminders
    fetch("/api/habits")
      .then((r) => r.json())
      .then((habits) => {
        const cleanup = scheduleAllReminders(
          habits.map((h: { name: string; reminderTime: string | null }) => ({
            name: h.name,
            reminderTime: h.reminderTime,
          })),
        );
        setHabitsLoaded(true);
        return cleanup;
      })
      .catch(() => {});
  }, [permission, habitsLoaded]);

  async function handleEnable() {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === "granted") {
      toast.success("Notifications enabled");
      showNotification("Monolith", { body: "Notifications are now active!" });
    } else {
      toast.error("Permission denied");
    }
  }

  if (permission === "granted") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="h-4 w-4 text-green-500" />
        Notifications enabled
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BellOff className="h-4 w-4 text-destructive" />
        Notifications blocked — enable in browser settings
      </div>
    );
  }

  return (
    <Button variant="outline" onClick={handleEnable}>
      <Bell className="h-4 w-4 mr-2" />
      Enable Notifications
    </Button>
  );
}
