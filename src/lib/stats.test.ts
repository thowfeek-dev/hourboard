import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { computeStatistics } from "@/lib/stats";
import type { DailyLogDTO } from "@/types";

function day(date: string, hours: number, tasks = 4): DailyLogDTO {
  return {
    date,
    weekday: "Monday",
    wins: "",
    blockers: "",
    carryForward: "",
    notes: "",
    energyLevel: 4,
    totalHours: hours,
    tasksDone: tasks,
    hitTarget: hours >= 8,
    tasks: Array.from({ length: tasks }, (_, i) => ({
      id: `${date}-${i}`,
      date,
      slotNumber: i + 1,
      title: "Task",
      priority: "H",
      done: true,
      hours: hours / tasks,
      notes: "",
      createdAt: "",
      updatedAt: "",
      projectId: null,
      tags: [],
    })),
  };
}

describe("computeStatistics", () => {
  it("counts hour-based streaks", () => {
    const stats = computeStatistics(
      [day("2026-08-21", 8), day("2026-08-22", 8.5), day("2026-08-23", 4)],
      { ...DEFAULT_SETTINGS },
      { start: "2026-08-21", end: "2026-08-23" },
    );
    expect(stats.daysHitTarget).toBe(2);
    expect(stats.bestStreak).toBe(2);
    expect(stats.totalHours).toBeGreaterThan(20);
    expect(stats.monthlyHours).toEqual([{ month: "2026-08", hours: 20.5 }]);
  });
});
