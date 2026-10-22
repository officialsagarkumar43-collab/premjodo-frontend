import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatConversationDateTime(dateString) {
  if (!dateString) return { date: "", time: "" };
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { date: "", time: "" };
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const timeStr = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (diffMs >= 0 && diffMs < 60000) {
      return { date: "Just now", time: timeStr };
    }

    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return { date: "Today", time: timeStr };
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return { date: "Yesterday", time: timeStr };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      const dayName = date.toLocaleDateString([], { weekday: "short" });
      return { date: dayName, time: timeStr };
    }

    const monthDay = date.toLocaleDateString([], { month: "short", day: "numeric" });
    return { date: monthDay, time: timeStr };
  } catch {
    return { date: "", time: "" };
  }
}

export function formatConversationTime(dateString) {
  const { date, time } = formatConversationDateTime(dateString);
  if (!date && !time) return "";
  if (date === "Today") return time;
  if (!time) return date;
  return `${date} • ${time}`;
}

export function formatTimeAgo(dateString) {
  return formatConversationTime(dateString);
}

export function formatLastActive(dateString) {
  if (!dateString) return "Offline";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Offline";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Future timestamp or less than 5 seconds difference
    if (diffMs <= 5000) return "Last active just now";
    
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return "Last active just now";
    const minutes = Math.floor(diffSecs / 60);
    if (minutes < 60) return `Last active ${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) {
        const timeStr = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
        return `Last active today at ${timeStr}`;
      }
      return `Last active ${hours}h ago`;
    }
    const days = Math.floor(hours / 24);
    if (days === 1) {
      const timeStr = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
      return `Last active yesterday at ${timeStr}`;
    }
    if (days < 7) return `Last active ${days}d ago`;
    return `Last active ${formatDate(dateString)}`;
  } catch {
    return "Offline";
  }
}

