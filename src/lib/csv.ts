import type { DailyLogDTO } from "@/types";

export function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line && !line.startsWith("#"));
  const [header, ...rows] = lines;
  if (!header?.toLowerCase().includes("date")) throw new Error("CSV is missing a Date column");
  const cols = header.split(",").map((item) => item.trim().toLowerCase());
  const dateIdx = cols.findIndex((col) => col === "date");
  const taskIdx = cols.findIndex((col) => col === "task");
  const hoursIdx = cols.findIndex((col) => col === "time used" || col === "hours");
  const slotIdx = cols.findIndex((col) => col === "slot");
  const weekdayIdx = cols.findIndex((col) => col === "weekday");
  const legacy = cols.includes("priority") || cols.includes("done");
  if (dateIdx < 0 || taskIdx < 0 || hoursIdx < 0) {
    throw new Error("CSV needs Date, Task, and Time used (or Hours) columns");
  }

  const grouped = new Map<string, DailyLogDTO>();
  for (const row of rows) {
    const parts = splitCsv(row);
    const date = parts[dateIdx];
    if (!date) continue;
    const current =
      grouped.get(date) ??
      ({
        date,
        weekday: weekdayIdx >= 0 ? parts[weekdayIdx] || "" : "",
        wins: "",
        blockers: "",
        carryForward: "",
        notes: "",
        energyLevel: null,
        tasks: [],
        totalHours: 0,
        tasksDone: 0,
        hitTarget: false,
      } satisfies DailyLogDTO);
    const slot = slotIdx >= 0 ? Number(parts[slotIdx] || current.tasks.length + 1) : current.tasks.length + 1;
    const title = parts[taskIdx] || "Untitled";
    const hours = legacy ? Number(parts[6] || 0) : Number(parts[hoursIdx] || 0);
    current.tasks.push({
      id: `${date}-${slot}`,
      date,
      slotNumber: slot,
      title,
      priority: legacy ? ((parts[4] as DailyLogDTO["tasks"][number]["priority"]) || "") : "",
      done: true,
      hours,
      notes: legacy ? parts[7] || "" : "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: null,
      projectName: legacy ? parts[8] || null : null,
      tags: [],
    });
    current.totalHours = Number(current.tasks.reduce((sum, task) => sum + task.hours, 0).toFixed(1));
    current.tasksDone = current.tasks.length;
    grouped.set(date, current);
  }
  return [...grouped.values()];
}

function splitCsv(line: string) {
  const out: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      out.push(current);
      current = "";
    } else current += char;
  }
  out.push(current);
  return out;
}
