import { getISOWeek, getYear, parseISO } from "date-fns";
import { WEEKDAYS } from "@/lib/constants";
import type { DailyLogDTO, SettingsDTO, Statistics } from "@/types";

function movingAverage(values: number[], window: number) {
  return values.map((_, index) => {
    const start = Math.max(0, index - window + 1);
    const slice = values.slice(start, index + 1);
    return slice.reduce((sum, value) => sum + value, 0) / slice.length;
  });
}

function pearson(xs: number[], ys: number[]) {
  if (xs.length < 3 || xs.length !== ys.length) return 0;
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : Number((num / den).toFixed(2));
}

function hourBucket(hours: number) {
  if (hours < 1) return "<1h";
  if (hours < 2) return "1-2h";
  if (hours < 4) return "2-4h";
  if (hours < 6) return "4-6h";
  if (hours < 8) return "6-8h";
  if (hours < 10) return "8-10h";
  if (hours < 12) return "10-12h";
  return "12+h";
}

export function computeStatistics(
  days: DailyLogDTO[],
  settings: SettingsDTO,
  range: { start: string; end: string },
): Statistics {
  const tracked = days.filter((day) => day.tasks.length > 0 || day.wins || day.notes);
  const allTasks = days.flatMap((day) => day.tasks);
  const doneTasks = allTasks.filter((task) => task.done);
  const totalHours = allTasks.reduce((sum, task) => sum + task.hours, 0);
  const hourTarget = settings.dailyTargetHours || 8;
  const daysHitTarget = days.filter((day) => day.totalHours >= hourTarget).length;
  const daysWithTasks = days.filter((day) => day.tasks.length > 0).length;

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let currentStreak = 0;
  let bestStreak = 0;
  let currentStreakStart: string | null = null;
  let bestStreakStart: string | null = null;
  let run = 0;
  let runStart: string | null = null;

  for (const day of sorted) {
    const hit = day.totalHours >= hourTarget;
    if (hit) {
      run += 1;
      if (!runStart) runStart = day.date;
      if (run > bestStreak) {
        bestStreak = run;
        bestStreakStart = runStart;
      }
    } else {
      run = 0;
      runStart = null;
    }
  }

  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    if (sorted[i].totalHours >= hourTarget) {
      currentStreak += 1;
      currentStreakStart = sorted[i].date;
    } else if (sorted[i].date < range.end) {
      break;
    }
  }

  const weekdayPerformance = Object.fromEntries(
    WEEKDAYS.map((name) => [name, { avgTasks: 0, avgHours: 0, daysTracked: 0 }]),
  ) as Statistics["weekdayPerformance"];

  for (const day of days) {
    const bucket = weekdayPerformance[day.weekday];
    if (!bucket) continue;
    bucket.daysTracked += 1;
    bucket.avgTasks += day.tasksDone;
    bucket.avgHours += day.totalHours;
  }
  for (const name of WEEKDAYS) {
    const bucket = weekdayPerformance[name];
    if (bucket.daysTracked) {
      bucket.avgTasks = Number((bucket.avgTasks / bucket.daysTracked).toFixed(2));
      bucket.avgHours = Number((bucket.avgHours / bucket.daysTracked).toFixed(2));
    }
  }

  const projectStats: Statistics["projectStats"] = {};
  for (const task of allTasks) {
    if (!task.projectId) continue;
    const current = projectStats[task.projectId] ?? {
      name: task.projectName ?? "Project",
      color: task.projectColor ?? "#6366f1",
      tasks: 0,
      hours: 0,
      completionRate: 0,
    };
    current.tasks += 1;
    current.hours += task.hours;
    current.completionRate += task.done ? 1 : 0;
    projectStats[task.projectId] = current;
  }
  for (const key of Object.keys(projectStats)) {
    const item = projectStats[key];
    item.completionRate = item.tasks ? Number(((item.completionRate / item.tasks) * 100).toFixed(1)) : 0;
    item.hours = Number(item.hours.toFixed(2));
  }

  const tagStats: Statistics["tagStats"] = {};
  for (const task of allTasks) {
    for (const tag of task.tags) {
      const current = tagStats[tag.id] ?? { name: tag.name, color: tag.color, tasks: 0, hours: 0 };
      current.tasks += 1;
      current.hours += task.hours;
      tagStats[tag.id] = current;
    }
  }

  const sampled = sorted.length > 180
    ? sorted.filter((_, index) => index % Math.ceil(sorted.length / 180) === 0 || index === sorted.length - 1)
    : sorted;
  const dates = sampled.map((day) => day.date);
  const tasksCompleted = sampled.map((day) => day.tasksDone);
  const hoursLogged = sampled.map((day) => Number(day.totalHours.toFixed(2)));

  const timeDistribution = {
    "<1h": 0,
    "1-2h": 0,
    "2-4h": 0,
    "4-6h": 0,
    "6-8h": 0,
    "8-10h": 0,
    "10-12h": 0,
    "12+h": 0,
  };
  for (const day of days) {
    timeDistribution[hourBucket(day.totalHours)] += 1;
  }

  const weekdayScores = WEEKDAYS.map((name) => ({
    name,
    avg: weekdayPerformance[name].avgHours,
  })).sort((a, b) => b.avg - a.avg);

  const weekBuckets = new Map<string, { week: number; year: number; tasks: number }>();
  for (const day of days) {
    const date = parseISO(day.date);
    const key = `${getYear(date)}-${getISOWeek(date)}`;
    const current = weekBuckets.get(key) ?? {
      week: getISOWeek(date),
      year: getYear(date),
      tasks: 0,
    };
    current.tasks += day.totalHours;
    weekBuckets.set(key, current);
  }
  const bestWeek = [...weekBuckets.values()].sort((a, b) => b.tasks - a.tasks)[0] ?? {
    week: 0,
    year: 0,
    tasks: 0,
  };

  const monthBuckets = new Map<string, number>();
  for (const day of days) {
    const key = day.date.slice(0, 7);
    monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + day.totalHours);
  }
  const bestMonthEntry = [...monthBuckets.entries()].sort((a, b) => b[1] - a[1])[0];

  const priorityCounts = {
    high: doneTasks.filter((task) => task.priority === "H").length +
      allTasks.filter((task) => !task.done && task.priority === "H").length,
    medium: allTasks.filter((task) => task.priority === "M").length,
    low: allTasks.filter((task) => task.priority === "L").length,
    unassigned: allTasks.filter((task) => !task.priority).length,
  };

  const mostUsedPriority = (
    [
      ["H", priorityCounts.high],
      ["M", priorityCounts.medium],
      ["L", priorityCounts.low],
    ] as Array<["H" | "M" | "L", number]>
  ).sort((a, b) => b[1] - a[1])[0][0];

  const energyPairs = days.filter((day) => day.energyLevel);
  const energyCorrelation = pearson(
    energyPairs.map((day) => day.energyLevel ?? 0),
    energyPairs.map((day) => day.totalHours),
  );

  const weekdayDays = days.filter((day) => !["Saturday", "Sunday"].includes(day.weekday));
  const weekendDays = days.filter((day) => ["Saturday", "Sunday"].includes(day.weekday));
  const weekdayAvg =
    weekdayDays.reduce((sum, day) => sum + day.totalHours, 0) / Math.max(1, weekdayDays.length);
  const weekendAvg =
    weekendDays.reduce((sum, day) => sum + day.totalHours, 0) / Math.max(1, weekendDays.length);
  const weekdayVsWeekend = weekendAvg === 0 ? 100 : Number((((weekdayAvg - weekendAvg) / weekendAvg) * 100).toFixed(0));

  const year = Number(range.end.slice(0, 4));
  const elapsed = daysWithTasks || 1;
  const pace = totalHours / elapsed;
  const dayOfYear = Math.max(1, Number(range.end.slice(5, 7)) * 30);
  const projectedYearEnd = Math.round(pace * 365);
  const yearTarget = hourTarget * 250;
  const remainingDays = Math.max(1, 365 - dayOfYear);
  const remainingNeeded = Math.max(0, yearTarget - totalHours);

  const consistencyScore = Math.round(
    (daysHitTarget / Math.max(1, daysWithTasks)) * 70 +
      Math.min(30, (bestStreak / 30) * 30),
  );

  return {
    totalTasks: allTasks.length,
    totalHours: Number(totalHours.toFixed(1)),
    daysTracked: tracked.length,
    daysWithTasks,
    daysHitTarget,
    targetAchievementRate: Number(((daysHitTarget / Math.max(1, daysWithTasks)) * 100).toFixed(1)),
    tasksNeededForTarget: Number(Math.max(0, hourTarget * daysWithTasks - totalHours).toFixed(1)),
    currentStreak,
    bestStreak,
    currentStreakStart,
    bestStreakStart,
    avgTasksPerDay: Number((doneTasks.length / Math.max(1, daysWithTasks)).toFixed(1)),
    avgHoursPerDay: Number((totalHours / Math.max(1, daysWithTasks)).toFixed(1)),
    avgTaskDuration: Number(((totalHours * 60) / Math.max(1, doneTasks.length)).toFixed(0)),
    priorityDistribution: priorityCounts,
    weekdayPerformance,
    projectStats,
    tagStats,
    trends: {
      dates,
      tasksCompleted,
      hoursLogged,
      movingAverage7: movingAverage(hoursLogged, 7).map((value) => Number(value.toFixed(2))),
      movingAverage30: movingAverage(hoursLogged, 30).map((value) => Number(value.toFixed(2))),
    },
    timeDistribution,
    monthlyHours: [...monthBuckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, hours]) => ({ month, hours: Number(hours.toFixed(1)) })),
    insights: {
      mostProductiveDay: weekdayScores[0]?.name ?? "Monday",
      mostProductiveWeek: bestWeek,
      mostUsedPriority,
      bestMonth: {
        month: bestMonthEntry?.[0] ?? range.start.slice(0, 7),
        tasks: bestMonthEntry?.[1] ?? 0,
      },
      consistencyScore,
      energyCorrelation,
      weekdayVsWeekend,
      projectedYearEnd,
      onTrack: projectedYearEnd >= yearTarget,
      tasksPerDayNeeded: Number((remainingNeeded / remainingDays).toFixed(1)),
      bestProjectedMonth: bestMonthEntry?.[0] ?? `${year}-10`,
    },
  };
}

export function collectAchievements(stats: Statistics) {
  return [
    {
      id: "hours-8",
      label: "8-Hour Day",
      emoji: "🎯",
      detail: "Average hours per worked day",
      earned: stats.avgHoursPerDay >= 8,
      current: stats.avgHoursPerDay,
      target: 8,
      unit: "h/day",
    },
    {
      id: "streak-7",
      label: "7-Day Streak",
      emoji: "🔥",
      detail: "Best consecutive 8h days",
      earned: stats.bestStreak >= 7,
      current: stats.bestStreak,
      target: 7,
      unit: "days",
    },
    {
      id: "streak-30",
      label: "30-Day Streak",
      emoji: "🏆",
      detail: "Longest 8h run",
      earned: stats.bestStreak >= 30,
      current: stats.bestStreak,
      target: 30,
      unit: "days",
    },
    {
      id: "tasks-100",
      label: "100 Tasks",
      emoji: "🧩",
      detail: "Finished work items",
      earned: stats.totalTasks >= 100,
      current: stats.totalTasks,
      target: 100,
      unit: "items",
    },
    {
      id: "hours-100",
      label: "100 Hours",
      emoji: "⏱️",
      detail: "Hours logged in range",
      earned: stats.totalHours >= 100,
      current: stats.totalHours,
      target: 100,
      unit: "h",
    },
    {
      id: "hours-500",
      label: "500 Hours",
      emoji: "🚀",
      detail: "Hours logged in range",
      earned: stats.totalHours >= 500,
      current: stats.totalHours,
      target: 500,
      unit: "h",
    },
    {
      id: "perfect-month",
      label: "Perfect Month",
      emoji: "⭐",
      detail: "8h hit rate with 20+ days",
      earned: stats.targetAchievementRate >= 95 && stats.daysWithTasks >= 20,
      current: stats.targetAchievementRate,
      target: 95,
      unit: "%",
    },
    {
      id: "weekly-champ",
      label: "Weekly Champion",
      emoji: "📈",
      detail: "Best week hours",
      earned: stats.insights.mostProductiveWeek.tasks >= 40,
      current: stats.insights.mostProductiveWeek.tasks,
      target: 40,
      unit: "h",
    },
  ];
}
