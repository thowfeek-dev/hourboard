export const APP_NAME = "Hourboard";
export const APP_VERSION = "1.0.0";

export const PRIORITIES = ["H", "M", "L", ""] as const;
export type Priority = (typeof PRIORITIES)[number];

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const DEFAULT_SETTINGS = {
  dailyTargetTasks: 12,
  dailyTargetHours: 8,
  dailySlots: 15,
  weekStartDay: 1 as 0 | 1 | 6,
  theme: "system" as const,
  defaultPriority: "M" as Priority,
  exportFormat: "json" as const,
  timeFormat: "24h" as const,
  dateFormat: "YYYY-MM-DD" as const,
  monthTarget: 160,
};

export const PRIORITY_LABEL: Record<Exclude<Priority, "">, string> = {
  H: "High",
  M: "Medium",
  L: "Low",
};

export const SHORTCUTS = [
  { keys: "Ctrl+←", action: "Previous day" },
  { keys: "Ctrl+→", action: "Next day" },
  { keys: "Ctrl+Shift+T", action: "Go to today" },
  { keys: "Ctrl+Shift+M", action: "Month view" },
  { keys: "Ctrl+Shift+Y", action: "Year view" },
  { keys: "Ctrl+Shift+A", action: "Analytics" },
  { keys: "Ctrl+Shift+S", action: "Settings" },
  { keys: "Ctrl+Shift+E", action: "Import / export" },
  { keys: "Ctrl+N", action: "Add task" },
  { keys: "Ctrl+B", action: "Batch add" },
  { keys: "Ctrl+F", action: "Search" },
  { keys: "Ctrl+Shift+D", action: "Toggle theme" },
] as const;
