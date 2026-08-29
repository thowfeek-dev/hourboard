"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Sparkles, Star, Target } from "lucide-react";
import { startOfMonth } from "date-fns";
import { saveMonthReview } from "@/server/actions";
import { shiftMonth } from "@/lib/dates";
import { heatClass } from "@/components/charts/hour-ring";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import type { DailyLogDTO, SettingsDTO } from "@/types";

export function MonthView({
  year,
  month,
  days,
  settings,
  review,
}: {
  year: number;
  month: number;
  days: DailyLogDTO[];
  settings: SettingsDTO;
  review: { keepDoing: string; stopChange: string; monthTarget: number } | null;
}) {
  const router = useRouter();
  const start = startOfMonth(new Date(year, month - 1, 1));
  const pad = (start.getDay() + 6) % 7;
  const cells = [...Array.from({ length: pad }, () => null), ...days];
  const hours = days.reduce((sum, day) => sum + day.totalHours, 0);
  const items = days.reduce((sum, day) => sum + day.tasksDone, 0);
  const hits = days.filter((day) => day.hitTarget).length;
  const worked = days.filter((day) => day.tasks.length).length;
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const label = start.toLocaleString("en-US", { month: "long", year: "numeric" });
  const target = settings.dailyTargetHours || 8;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Month</p>
          <h1 className="text-2xl font-semibold tracking-tight">{label}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/month/${prev.year}/${prev.month}`)}>Prev</Button>
          <Button variant="outline" onClick={() => router.push(`/month/${next.year}/${next.month}`)}>Next</Button>
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
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d}>{d}</div>
        ))}
        {cells.map((day, i) =>
          day ? (
            <Link
              key={day.date}
              href={`/day/${day.date}`}
              className={`min-h-20 rounded-md border p-2 text-left hover:border-primary ${heatClass(day.totalHours, target)}`}
            >
              <div className="text-xs font-bold">{Number(day.date.slice(8))}</div>
              <div className="mt-2 font-mono text-xs font-bold">{day.totalHours.toFixed(1)}h</div>
              {day.hitTarget ? <Star className="mt-1 size-3" aria-label="8 hour day" /> : null}
            </Link>
          ) : (
            <div key={`empty-${i}`} />
          ),
        )}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Month review</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3"
            action={async (form) => {
              await saveMonthReview({
                year,
                month,
                monthTarget: Number(form.get("monthTarget") || settings.monthTarget),
                keepDoing: String(form.get("keepDoing") || ""),
                stopChange: String(form.get("stopChange") || ""),
                carryOver: [],
              });
              router.refresh();
            }}
          >
            <Input name="monthTarget" type="number" defaultValue={review?.monthTarget ?? settings.monthTarget} aria-label="Month hours target" />
            <Textarea name="keepDoing" placeholder="Keep doing" defaultValue={review?.keepDoing ?? ""} />
            <Textarea name="stopChange" placeholder="Stop / change" defaultValue={review?.stopChange ?? ""} />
            <Button type="submit">Save review</Button>
          </form>
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
