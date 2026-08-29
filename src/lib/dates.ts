import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  getISOWeek,
  getISOWeekYear,
  getYear,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from "date-fns";

export function toISODate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function parseDate(value: string) {
  const date = parseISO(value);
  if (!isValid(date) || value.length !== 10) return null;
  return date;
}

export function requireDate(value: string) {
  const date = parseDate(value);
  if (!date) throw new Error(`Invalid date: ${value}`);
  return date;
}

export function weekdayName(date: Date) {
  return format(date, "EEEE");
}

export function displayDate(date: Date, pattern = "d MMMM yyyy") {
  return format(date, pattern);
}

export function todayISO() {
  return toISODate(new Date());
}

export function shiftDay(iso: string, amount: number) {
  return toISODate(addDays(requireDate(iso), amount));
}

export function shiftMonth(year: number, month: number, amount: number) {
  const next = addMonths(new Date(year, month - 1, 1), amount);
  return { year: next.getFullYear(), month: next.getMonth() + 1 };
}

export function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function weekBounds(year: number, week: number, weekStartsOn: 0 | 1 | 6 = 1) {
  const jan4 = new Date(year, 0, 4);
  const start = startOfWeek(jan4, { weekStartsOn });
  const target = addWeeks(start, week - 1);
  return {
    start: toISODate(startOfWeek(target, { weekStartsOn })),
    end: toISODate(endOfWeek(target, { weekStartsOn })),
  };
}

export function isoWeekOf(date: Date) {
  return getISOWeek(date);
}

export function isoWeekRef(iso: string) {
  const date = requireDate(iso);
  return { year: getISOWeekYear(date), week: getISOWeek(date) };
}

export function formatDayAsText(day: {
  date: string;
  weekday: string;
  totalHours: number;
  tasks: { slotNumber: number; title: string; hours: number }[];
}) {
  const header = `${day.date} (${day.weekday}) · ${day.totalHours.toFixed(1)}h`;
  if (!day.tasks.length) return `${header}\nNo tasks`;
  const rows = [...day.tasks]
    .sort((a, b) => a.slotNumber - b.slotNumber)
    .map(
      (task) =>
        `- TSK-${String(task.slotNumber).padStart(2, "0")}  ${task.title}  ${task.hours}h`,
    );
  return [header, ...rows].join("\n");
}

export function yearOf(date: Date) {
  return getYear(date);
}

export function daysInRange(start: string, end: string) {
  return eachDayOfInterval({
    start: requireDate(start),
    end: requireDate(end),
  }).map(toISODate);
}

export function monthDays(year: number, month: number) {
  const start = startOfMonth(new Date(year, month - 1, 1));
  return eachDayOfInterval({ start, end: endOfMonth(start) }).map(toISODate);
}

export function yearDays(year: number) {
  const start = startOfYear(new Date(year, 0, 1));
  return eachDayOfInterval({ start, end: endOfYear(start) }).map(toISODate);
}

export function recentDays(count: number, from = new Date()) {
  return Array.from({ length: count }, (_, i) => toISODate(subDays(from, i)));
}

export function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}
