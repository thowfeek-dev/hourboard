import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { APP_NAME, APP_VERSION } from "@/lib/constants";
import type { AppBackup, DailyLogDTO, SettingsDTO, Statistics } from "@/types";

export { parseCsv } from "@/lib/csv";

export function buildBackup(
  settings: SettingsDTO,
  days: DailyLogDTO[],
  extras: Pick<AppBackup, "projects" | "tags">,
): AppBackup {
  const months: AppBackup["months"] = {};
  for (const day of days) {
    const key = day.date.slice(0, 7);
    const [year, month] = key.split("-").map(Number);
    if (!months[key]) months[key] = { year, month, days: [] };
    months[key].days.push(day);
  }
  return {
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    months,
    projects: extras.projects,
    tags: extras.tags,
  };
}

export function workLogRows(days: DailyLogDTO[]) {
  return days.flatMap((day) =>
    day.tasks.map((task) => ({
      date: day.date,
      task: task.title,
      hours: task.hours,
    })),
  );
}

export function toCsv(days: DailyLogDTO[], stats?: Statistics, range?: { start: string; end: string }) {
  const generated = new Date().toISOString();
  const header = [
    `# ${APP_NAME} work log`,
    `# Generated: ${generated}`,
    range ? `# Range: ${range.start} — ${range.end}` : undefined,
    stats ? `# Total hours: ${stats.totalHours} · Tasks: ${stats.totalTasks}` : undefined,
    "Date,Task,Time used",
  ].filter(Boolean) as string[];
  const rows = workLogRows(days).map((row) => [row.date, csv(row.task), row.hours].join(","));
  const footer = stats ? [`# End of export · ${stats.totalHours} hours`] : [];
  return [...header, ...rows, ...footer].join("\n");
}

function csv(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function toExcel(days: DailyLogDTO[], stats: Statistics) {
  const summary = XLSX.utils.aoa_to_sheet([
    [`${APP_NAME} hours report`],
    ["Total hours", stats.totalHours],
    ["Work items", stats.totalTasks],
    ["Days worked", stats.daysWithTasks],
    ["8h hit rate", `${stats.targetAchievementRate}%`],
    ["Best streak", stats.bestStreak],
    ["Avg hours / day", stats.avgHoursPerDay],
  ]);
  const daily = XLSX.utils.json_to_sheet(
    workLogRows(days).map((row) => ({
      Date: row.date,
      Task: row.task,
      "Time used": row.hours,
    })),
  );
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, daily, "Work Log");
  XLSX.utils.book_append_sheet(book, summary, "Summary");
  return XLSX.write(book, { type: "array", bookType: "xlsx" }) as Uint8Array;
}

export function toPdf(days: DailyLogDTO[], stats: Statistics, range: { start: string; end: string }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const rows = workLogRows(days);
  const generated = new Date().toLocaleString();

  function header(page: number, total: number) {
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, pageWidth, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(APP_NAME, 14, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Date · Task · Time used", 14, 20);
    doc.text(`Page ${page} / ${total}`, pageWidth - 14, 12, { align: "right" });
    doc.setTextColor(20, 20, 20);
  }

  function footer() {
    doc.setDrawColor(200, 200, 200);
    doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.text(`${generated}  ·  ${range.start} — ${range.end}`, 14, pageHeight - 9);
    doc.text(`Total ${stats.totalHours}h  ·  ${stats.totalTasks} tasks`, pageWidth - 14, pageHeight - 9, {
      align: "right",
    });
    doc.setTextColor(20, 20, 20);
  }

  const bodyStart = 44;
  const rowHeight = 8;
  const rowsPerPage = Math.floor((pageHeight - bodyStart - 22) / rowHeight);
  const totalPages = Math.max(1, Math.ceil((rows.length + 1) / rowsPerPage));

  let page = 1;
  header(page, totalPages);
  doc.setFontSize(9);
  doc.text(`Range ${range.start} — ${range.end}  ·  Generated ${generated}`, 14, 36);
  doc.setFont("helvetica", "bold");
  doc.text("Date", 14, bodyStart);
  doc.text("Task", 48, bodyStart);
  doc.text("Time used", pageWidth - 14, bodyStart, { align: "right" });
  doc.setFont("helvetica", "normal");
  footer();

  let y = bodyStart + 8;
  let onPage = 1;
  if (!rows.length) {
    doc.text("No tasks in this range.", 14, y);
  }
  for (const row of rows) {
    if (onPage >= rowsPerPage) {
      doc.addPage();
      page += 1;
      header(page, totalPages);
      footer();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Date", 14, bodyStart);
      doc.text("Task", 48, bodyStart);
      doc.text("Time used", pageWidth - 14, bodyStart, { align: "right" });
      doc.setFont("helvetica", "normal");
      y = bodyStart + 8;
      onPage = 1;
    }
    const title = doc.splitTextToSize(row.task, pageWidth - 90);
    doc.text(row.date, 14, y);
    doc.text(title[0] ?? "", 48, y);
    doc.text(`${Number(row.hours).toFixed(1)}h`, pageWidth - 14, y, { align: "right" });
    y += rowHeight;
    onPage += 1;
  }
  return doc.output("arraybuffer");
}
