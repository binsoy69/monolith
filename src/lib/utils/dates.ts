export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDaysInRange(start: string, end: string): string[] {
  const days: string[] = [];
  const current = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T00:00:00");
  while (current <= endDate) {
    days.push(toISODate(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function startOfMonth(date: Date): string {
  return toISODate(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function endOfMonth(date: Date): string {
  return toISODate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}
