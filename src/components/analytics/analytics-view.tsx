"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WEEKDAYS } from "@/lib/constants";
import { collectAchievements } from "@/lib/stats";
import { formatNumber } from "@/lib/utils";
import type { Statistics } from "@/types";

const AnalyticsCharts = dynamic(
  () => import("@/components/analytics/analytics-charts").then((mod) => mod.AnalyticsCharts),
  {
    ssr: false,
    loading: () => <div className="h-80 animate-pulse rounded-xl bg-muted" aria-hidden />,
  },
);

export function AnalyticsView({ stats }: { stats: Statistics }) {
  const weekday = WEEKDAYS.map((name) => ({
    name: name.slice(0, 3),
    hours: stats.weekdayPerformance[name].avgHours,
  }));
  const hours = Object.entries(stats.timeDistribution).map(([name, value]) => ({ name, value }));
  const trend = stats.trends.dates.map((date, i) => ({
    date,
    hours: stats.trends.hoursLogged[i],
    avg7: stats.trends.movingAverage7[i],
    avg30: stats.trends.movingAverage30[i],
  }));
  const projects = Object.values(stats.projectStats)
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 8)
    .map((row) => ({ name: row.name, hours: row.hours, tasks: row.tasks }));
  const tags = Object.values(stats.tagStats)
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 8)
    .map((row) => ({ name: row.name, hours: Number(row.hours.toFixed(1)), tasks: row.tasks }));
  const priority = [
    { name: "High", value: stats.priorityDistribution.high },
    { name: "Medium", value: stats.priorityDistribution.medium },
    { name: "Low", value: stats.priorityDistribution.low },
    { name: "None", value: stats.priorityDistribution.unassigned },
  ];
  const maxWeekday = Math.max(...weekday.map((row) => row.hours), 0.1);
  const achievements = collectAchievements(stats);
  const kpis = [
    { label: "Total hours", value: formatNumber(stats.totalHours, 1), hint: `${stats.daysWithTasks} days with work` },
    { label: "Work items", value: formatNumber(stats.totalTasks), hint: `${stats.avgTasksPerDay} per day` },
    { label: "Avg day", value: `${formatNumber(stats.avgHoursPerDay, 1)}h`, hint: `${stats.avgTaskDuration} min / item` },
    { label: "8h hit rate", value: `${stats.targetAchievementRate}%`, hint: `${stats.daysHitTarget} days hit target` },
    { label: "Current streak", value: `${stats.currentStreak}d`, hint: stats.currentStreakStart ?? "No active streak" },
    { label: "Best streak", value: `${stats.bestStreak}d`, hint: stats.bestStreakStart ?? "No streak yet" },
  ];
  const insights = [
    { label: "Year pace", value: `${formatNumber(stats.insights.projectedYearEnd)}h`, hint: "Projected year-end hours" },
    { label: "On the 8h path", value: stats.insights.onTrack ? "Yes" : "Not yet", hint: "Pace vs yearly target" },
    { label: "Need per day", value: `${stats.insights.tasksPerDayNeeded}h`, hint: "To stay on target" },
    { label: "Best month", value: stats.insights.bestMonth.month, hint: `${Number(stats.insights.bestMonth.tasks).toFixed(0)}h that month` },
    { label: "Best week", value: `W${stats.insights.mostProductiveWeek.week}`, hint: `${Number(stats.insights.mostProductiveWeek.tasks).toFixed(0)}h in ${stats.insights.mostProductiveWeek.year}` },
    { label: "Consistency", value: `${stats.insights.consistencyScore}`, hint: "Hit rate + streak score" },
    { label: "Energy vs hours", value: `r=${stats.insights.energyCorrelation}`, hint: "Correlation" },
    { label: "Weekday vs weekend", value: `${stats.insights.weekdayVsWeekend}%`, hint: "Weekday advantage" },
    { label: "Most productive day", value: stats.insights.mostProductiveDay, hint: "Highest average hours" },
    { label: "Top priority", value: stats.insights.mostUsedPriority, hint: "Most used priority" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Analytics</p>
        <h1 className="gradient-text text-2xl font-semibold tracking-tight sm:text-3xl">Hours</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{item.value}</p>
              <p className="text-[11px] text-muted-foreground">{item.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <AnalyticsCharts
        weekday={weekday}
        hours={hours}
        trend={trend}
        monthly={stats.monthlyHours}
        projects={projects}
        tags={tags}
        priority={priority}
      />
      <Card>
        <CardHeader>
          <CardTitle>What the numbers say</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {insights.map((item) => (
              <div key={item.label} className="rounded-md border border-border p-3 sheet-odd">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{item.value}</p>
                <p className="text-[11px] text-muted-foreground">{item.hint}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>Consistency score</span>
              <span className="font-mono">{stats.insights.consistencyScore}/100</span>
            </div>
            <Progress value={stats.insights.consistencyScore} />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Average hours by weekday</p>
            {weekday.map((row) => (
              <div key={row.name} className="grid grid-cols-[3rem_1fr_3.5rem] items-center gap-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground">{row.name}</span>
                <Progress value={(row.hours / maxWeekday) * 100} className="h-1.5" />
                <span className="font-mono text-xs tabular-nums">{row.hours.toFixed(1)}h</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {achievements.map((item) => {
              const pct = Math.min(100, Math.round((item.current / Math.max(item.target, 0.1)) * 100));
              return (
                <div key={item.id} className={`rounded-md border border-border p-3 ${item.earned ? "bg-success/10" : "sheet-even"}`}>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                  <Progress value={pct} className="mt-3 h-1.5" />
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {formatNumber(item.current, item.unit === "%" || item.unit === "h/day" || item.unit === "h" ? 1 : 0)} / {item.target} {item.unit}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekday hours</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[280px] text-sm">
              <caption className="sr-only">Weekday hours</caption>
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="px-5 py-2">Day</th>
                  <th>Avg hours</th>
                  <th>Days</th>
                </tr>
              </thead>
              <tbody>
                {WEEKDAYS.map((name, index) => (
                  <tr key={name} className={`border-t border-border ${index % 2 === 0 ? "sheet-odd" : "sheet-even"}`}>
                    <td className="px-5 py-2">{name}</td>
                    <td className="font-mono">{stats.weekdayPerformance[name].avgHours}</td>
                    <td className="font-mono">{stats.weekdayPerformance[name].daysTracked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
