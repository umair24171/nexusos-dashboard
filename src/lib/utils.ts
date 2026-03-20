import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM dd, yyyy HH:mm:ss");
}

export function formatTimeAgo(date: string | Date) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

export function truncate(str: string, length: number = 32) {
  return str.length > length ? str.substring(0, length) + "..." : str;
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return key;
  return key.substring(0, 4) + "*".repeat(key.length - 8) + key.substring(key.length - 4);
}

export function statusColor(
  status: "active" | "paused" | "killed"
): "text-green-400" | "text-yellow-400" | "text-red-400" {
  switch (status) {
    case "active":
      return "text-green-400";
    case "paused":
      return "text-yellow-400";
    case "killed":
      return "text-red-400";
  }
}

export function severityColor(
  severity: "info" | "warning" | "critical"
): "text-blue-400" | "text-yellow-400" | "text-red-500" {
  switch (severity) {
    case "info":
      return "text-blue-400";
    case "warning":
      return "text-yellow-400";
    case "critical":
      return "text-red-500";
  }
}

export function severityBgColor(
  severity: "info" | "warning" | "critical"
): "bg-blue-500/10" | "bg-yellow-500/10" | "bg-red-500/10" {
  switch (severity) {
    case "info":
      return "bg-blue-500/10";
    case "warning":
      return "bg-yellow-500/10";
    case "critical":
      return "bg-red-500/10";
  }
}
