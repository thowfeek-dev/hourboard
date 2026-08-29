"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Sparkles, Star, Target } from "lucide-react";
import { heatClass } from "@/components/charts/hour-ring";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DailyLogDTO, SettingsDTO } from "@/types";

export function WeekView({
  year,
  week,
  bounds,
  days,
  settings,
}: {
  year: number;
  week: number;
  bounds: { start: string; end: string };
  days: DailyLogDTO[];
  settings: SettingsDTO;
}) {
  const router = useRouter();
  const hours = days.reduce((sum, day) => sum + day.totalHours, 0);
  const items = days.reduce((sum, day) => sum + day.tasksDone, 0);
  const hits = days.filter((day) => day.hitTarget).length;
  const worked = days.filter((day) => day.tasks.length).length;
  const target = settings.dailyTargetHours || 8;
  const maxHours = Math.max(target, ...days.map((day) => day.totalHours), 1);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Week</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Week {week}, {year}
          </h1>
          <p className="text-sm text-muted-foreground">
            {bounds.start} → {bounds.end}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/week/${year}/${Math.max(1, week - 1)}`)}>
            Prev
          </Button>
          <Button variant="outline" onClick={() => router.push(`/week/${year}/${week + 1}`)}>
            Next
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat icon={Clock} label="Hours" value={hours.toFixed(1)} color="#818cf8" />
        <Stat icon={Sparkles} label="Items" value={String(items)} color="#22d3ee" />
        <Stat icon={Star} label="8h days" value={String(hits)} color="#fbbf24" />
        <Stat icon={Target} label="Hit rate" value={`${worked ? Math.round((hits / worked) * 100) : 0}%`} color="#34d399" />
      </div>
      <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
        <div className="grid min-w-[640px] grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
        {days.map((day) => (
          <div key={`label-${day.date}`}>{day.weekday.slice(0, 3)}</div>
        ))}
        {days.map((day) => (
          <Link
            key={day.date}
            href={`/day/${day.date}`}
            className={`min-h-24 rounded-md border p-2 text-left hover:border-primary ${heatClass(day.totalHours, target)}`}
          >
            <div className="text-xs font-bold">{Number(day.date.slice(8))}</div>
            <div className="mt-2 font-mono text-xs font-bold">{day.totalHours.toFixed(1)}h</div>
            <div className="text-[11px] opacity-80">{day.tasksDone} items</div>
          {day.hitTarget ? <Star className="mt-1 size-3" aria-label="8 hour day" /> : null}
        </Link>
        ))}
        </div>
      </div>
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Hours by day</p>
          {days.map((day) => (
            <Link key={`bar-${day.date}`} href={`/day/${day.date}`} className="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-3 text-sm">
              <span className="font-mono text-xs text-muted-foreground">{day.weekday.slice(0, 3)}</span>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, (day.totalHours / maxHours) * 100)}%` }}
                />
              </div>
              <span className="font-mono text-xs tabular-nums">{day.totalHours.toFixed(1)}h</span>
            </Link>
          ))}
        </CardContent>
      </Card>
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
