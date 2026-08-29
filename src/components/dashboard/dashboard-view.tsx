"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { collectAchievements } from "@/lib/stats";
import { formatNumber } from "@/lib/utils";
import { HeroArt } from "@/components/art/scene";
import { HourRing } from "@/components/charts/hour-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { DaySummary, SettingsDTO, Statistics } from "@/types";

const DashboardCharts = dynamic(
  () => import("@/components/dashboard/dashboard-charts").then((mod) => mod.DashboardCharts),
  {
    ssr: false,
    loading: () => <div className="h-80 animate-pulse rounded-xl bg-muted" aria-hidden />,
  },
);

function heatClass(hours: number, target: number) {
  if (hours <= 0) return "heat-0";
  const ratio = hours / target;
  if (ratio < 0.4) return "heat-1";
  if (ratio < 0.75) return "heat-2";
  if (ratio < 1) return "heat-3";
  return "heat-4";
}

export function DashboardView({
  stats,
  settings,
  days,
  recent,
  year,
  firstName,
}: {
  stats: Statistics;
  settings: SettingsDTO;
  days: DaySummary[];
  recent: DaySummary[];
  year: number;
  firstName?: string | null;
}) {
  const router = useRouter();
  const target = settings.dailyTargetHours || 8;
  const [start, setStart] = useState(days[0]?.date ?? `${year}-01-01`);
  const [end, setEnd] = useState(days.at(-1)?.date ?? `${year}-12-31`);
  const achievements = collectAchievements(stats);
  const byDate = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);
  const chartData = stats.trends.dates.map((date, i) => ({
    date,
    hours: stats.trends.hoursLogged[i],
    ma7: stats.trends.movingAverage7[i],
    ma30: stats.trends.movingAverage30[i],
  }));
  const weekdayBars = Object.entries(stats.weekdayPerformance).map(([name, value]) => ({
    name: name.slice(0, 3),
    hours: value.avgHours,
  }));

  const weeks: (string | null)[][] = [];
  const startDate = new Date(`${year}-01-01T00:00:00`);
  const cells: (string | null)[] = Array.from({ length: startDate.getDay() }, () => null);
  for (let m = 0; m < 12; m += 1) {
    const dim = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= dim; d += 1) {
      cells.push(`${year}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
  }
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="relative z-10 space-y-6">
      <div className="flex flex-wrap items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="min-w-[220px] flex-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Overview</p>
          <h1 className="gradient-text text-3xl font-semibold tracking-tight">
            {firstName ? `Hi, ${firstName}` : "Hourboard"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats.daysWithTasks === 0
              ? "Your board is empty. Add a finished task to start your private hour log."
              : `Daily target is ${target} hours. Log work after you finish it.`}
          </p>
        </div>
        <HeroArt />
        <HourRing hours={stats.avgHoursPerDay} target={target} />
      </div>

      {stats.daysWithTasks === 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Start with today. Nobody else can see this board.</p>
            <Button asChild className="h-11 sm:h-9">
              <Link href={`/day/${end}`}>Log first task</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} aria-label="Range start" />
        <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} aria-label="Range end" />
        <Button onClick={() => router.push(`/?start=${start}&end=${end}`)}>Apply</Button>
        <Button variant="outline" onClick={() => router.push("/")}>Reset</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Hours", value: formatNumber(stats.totalHours, 1), emoji: "⏱️" },
          { label: "Work items", value: formatNumber(stats.totalTasks), emoji: "🧩" },
          { label: "Streak", value: `${stats.currentStreak}d`, emoji: "🔥" },
          { label: "8h hit rate", value: `${stats.targetAchievementRate}%`, emoji: "🎯" },
          { label: "Avg hours", value: formatNumber(stats.avgHoursPerDay, 1), emoji: "📈" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <span className="text-lg" aria-hidden>
                {item.emoji}
              </span>
              <p className="mt-2 text-xs text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-semibold tabular-nums">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <DashboardCharts chartData={chartData} weekdayBars={weekdayBars} />

      <Card>
        <CardHeader>
          <CardTitle>🗺️ Year heatmap · {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex min-w-[720px] gap-1">
              {weeks.map((week, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {week.map((iso, j) => {
                    if (!iso) return <div key={`${i}-${j}`} className="size-3 rounded-sm" />;
                    const day = byDate.get(iso);
                    return (
                      <Link
                        key={iso}
                        href={`/day/${iso}`}
                        title={`${iso}: ${day?.totalHours ?? 0}h`}
                        className={`size-3 rounded-sm ${heatClass(day?.totalHours ?? 0, target)}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Cyan → green → gold → red as hours climb toward (and past) 8h.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>📅 Recent days</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...recent].reverse().map((day) => (
              <Link
                key={day.date}
                href={`/day/${day.date}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 hover:bg-muted"
              >
                <span className="font-mono text-xs">DAY-{day.date.slice(8)}</span>
                <span className="text-sm">{day.date}</span>
                <span className="font-mono text-sm">{day.totalHours.toFixed(1)}h</span>
                <Badge tone={day.hitTarget ? "success" : "medium"}>{day.hitTarget ? "8h" : "open"}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>🏆 Achievements</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {achievements.map((item) => {
              const pct = Math.min(100, Math.round((item.current / Math.max(item.target, 0.1)) * 100));
              return (
                <div
                  key={item.id}
                  className={`rounded-md border border-border p-3 ${item.earned ? "bg-success/10" : "sheet-even"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">
                      <span aria-hidden>{item.emoji}</span> {item.label}
                    </p>
                    <Badge tone={item.earned ? "success" : "default"}>{item.earned ? "Earned" : "Locked"}</Badge>
                  </div>
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
      </div>

      <Button asChild>
        <Link href={`/day/${end}`}>Open today board 🚀</Link>
      </Button>
    </div>
  );
}
