/**
 * Browser Notification API utilities for habit reminders.
 */

export type NotificationPermissionStatus = "granted" | "denied" | "default";

/**
 * Request notification permission from the browser.
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (!("Notification" in window)) {
    console.warn("Notifications not supported in this browser");
    return "denied";
  }
  const result = await Notification.requestPermission();
  return result as NotificationPermissionStatus;
}

/**
 * Check current notification permission status.
 */
export function getNotificationPermission(): NotificationPermissionStatus {
  if (!("Notification" in window)) return "denied";
  return Notification.permission as NotificationPermissionStatus;
}

/**
 * Show a browser notification.
 */
export function showNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
  },
): Notification | null {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return null;
  }

  return new Notification(title, {
    body: options?.body,
    icon: options?.icon || "/icon-192.png",
    tag: options?.tag,
  });
}

/**
 * Schedule a habit reminder notification.
 * Uses setTimeout to fire at the specified time today.
 * Returns a cleanup function to cancel the timer.
 */
export function scheduleHabitReminder(
  habitName: string,
  reminderTime: string, // "HH:mm"
): (() => void) | null {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return null;
  }

  const [hours, minutes] = reminderTime.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  // If the time has already passed today, skip
  if (target.getTime() <= now.getTime()) {
    return null;
  }

  const delay = target.getTime() - now.getTime();
  const timer = setTimeout(() => {
    showNotification("Habit Reminder", {
      body: `Time to complete: ${habitName}`,
      tag: `habit-reminder-${habitName}`,
    });
  }, delay);

  return () => clearTimeout(timer);
}

/**
 * Schedule reminders for multiple habits.
 * Returns a cleanup function to cancel all timers.
 */
export function scheduleAllReminders(
  habits: { name: string; reminderTime: string | null }[],
): () => void {
  const cleanups: (() => void)[] = [];

  for (const habit of habits) {
    if (habit.reminderTime) {
      const cleanup = scheduleHabitReminder(habit.name, habit.reminderTime);
      if (cleanup) cleanups.push(cleanup);
    }
  }

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
