import { describe, expect, it } from "vitest";
import { parseCsv } from "@/lib/csv";
import { formatDayAsText } from "@/lib/dates";
import { toCsv } from "@/lib/export";
import type { DailyLogDTO } from "@/types";

const sample: DailyLogDTO = {
  date: "2026-08-23",
  weekday: "Sunday",
  wins: "",
  blockers: "",
  carryForward: "",
  notes: "",
  energyLevel: null,
  totalHours: 3.5,
  tasksDone: 2,
  hitTarget: false,
  tasks: [
    {
      id: "1",
      date: "2026-08-23",
      slotNumber: 1,
      title: "Landing copy",
      priority: "",
      done: true,
      hours: 1,
      notes: "",
      createdAt: "",
      updatedAt: "",
      projectId: null,
      tags: [],
    },
    {
      id: "2",
      date: "2026-08-23",
      slotNumber: 2,
      title: "Review PR",
      priority: "",
      done: true,
      hours: 2.5,
      notes: "",
      createdAt: "",
      updatedAt: "",
      projectId: null,
      tags: [],
    },
  ],
};

describe("day text copy", () => {
  it("formats date, task, and hours", () => {
    const text = formatDayAsText(sample);
    expect(text).toContain("2026-08-23 (Sunday) · 3.5h");
    expect(text).toContain("Landing copy  1h");
    expect(text).toContain("Review PR  2.5h");
  });
});

describe("csv export", () => {
  it("uses Date, Task, Time used columns", () => {
    const csv = toCsv([sample]);
    expect(csv).toContain("Date,Task,Time used");
    expect(csv).toContain("2026-08-23,Landing copy,1");
    const parsed = parseCsv(csv);
    expect(parsed[0]?.tasks).toHaveLength(2);
    expect(parsed[0]?.tasks[1]?.hours).toBe(2.5);
  });
});
