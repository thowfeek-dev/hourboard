"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Flame, Sparkles, Star, Target } from "lucide-react";
import { heatClass } from "@/components/charts/hour-ring";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DaySummary, SettingsDTO, Statistics } from "@/types";

export function YearView({
  year,
  days,
  settings,
  stats,
}: {
  year: number;
  days: DaySummary[];
  settings: SettingsDTO;
  stats: Statistics;
}) {
  const router = useRouter();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const target = settings.dailyTargetHours || 8;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Year</p>
          <h1 className="text-2xl font-semibold tracking-tight">{year}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/year/${year - 1}`)}>Prev</Button>
          <Button variant="outline" onClick={() => router.push(`/year/${year + 1}`)}>Next</Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-5">
        <Stat icon={Clock} label="Hours" value={stats.totalHours.toFixed(1)} color="#818cf8" />
        <Stat icon={Sparkles} label="Items" value={String(stats.totalTasks)} color="#22d3ee" />
        <Stat icon={Star} label="Best month" value={stats.insights.bestMonth.month} color="#fbbf24" />
        <Stat icon={Target} label="8h rate" value={`${stats.targetAchievementRate}%`} color="#34d399" />
        <Stat icon={Flame} label="Avg / day" value={stats.avgHoursPerDay.toFixed(1)} color="#c4b5fd" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {months.map((month) => {
          const slice = days.filter((day) => Number(day.date.slice(5, 7)) === month);
          const hours = slice.reduce((sum, day) => sum + day.totalHours, 0);
          const hits = slice.filter((day) => day.hitTarget).length;
          const worked = slice.filter((day) => day.taskCount).length;
          return (
            <Link key={month} href={`/month/${year}/${month}`}>
              <Card className="h-full hover:border-primary">
                <CardContent className="p-4">
                  <p className="text-lg font-semibold">
                    {new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long" })}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {slice.slice(0, 31).map((day) => (
                      <span
                        key={day.date}
                        title={`${day.date}: ${day.totalHours}h`}
                        className={`size-2 rounded-sm ${heatClass(day.totalHours, target)}`}
                      />
                    ))}
                  </div>
                  <p className="mt-3 font-mono text-xs text-muted-foreground">
                    {hours.toFixed(1)}h · {worked ? Math.round((hits / worked) * 100) : 0}% 8h
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: typeof Clock; label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <Icon className="size-4" style={{ color }} aria-hidden />
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
