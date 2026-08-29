"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Clock, Copy, ListPlus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { batchAddTasks, clearDay, deleteTask, updateTask, upsertTask } from "@/server/actions";
import { formatDayAsText, isoWeekOf, requireDate, shiftDay, todayISO } from "@/lib/dates";
import { TICKET_COLORS, HourRing } from "@/components/charts/hour-ring";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import type { DailyLogDTO, SettingsDTO, TaskDTO } from "@/types";

export function DayView({ day, settings }: { day: DailyLogDTO; settings: SettingsDTO }) {
  const router = useRouter();
  const setTaskDialogOpen = useUiStore((s) => s.setTaskDialogOpen);
  const [pending, startTransition] = useTransition();
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchText, setBatchText] = useState("Write landing copy\nReview pull request\nClient call");
  const target = settings.dailyTargetHours || 8;
  const percent = Math.min(100, Math.round((day.totalHours / target) * 100));
  const slots = useMemo(() => {
    const map = new Map(day.tasks.map((task) => [task.slotNumber, task]));
    return Array.from({ length: settings.dailySlots }, (_, i) => map.get(i + 1) ?? null);
  }, [day.tasks, settings.dailySlots]);

  function run(label: string, fn: () => Promise<unknown>) {
    startTransition(async () => {
      try {
        await fn();
        toast.success(label);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save");
      }
    });
  }

  async function copyDayText() {
    const text = formatDayAsText(day);
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied day's tasks");
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div className="relative z-10 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-widest text-primary uppercase">
            {day.weekday} · Week {isoWeekOf(requireDate(day.date))}
          </p>
          <h1 className="gradient-text text-2xl font-semibold tracking-tight sm:text-3xl">{day.date}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="size-11 sm:size-9" aria-label="Previous day" onClick={() => router.push(`/day/${shiftDay(day.date, -1)}`)}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" className="h-11 sm:h-9" onClick={() => router.push(`/day/${todayISO()}`)}>Today</Button>
          <Button variant="outline" size="icon" className="size-11 sm:size-9" aria-label="Next day" onClick={() => router.push(`/day/${shiftDay(day.date, 1)}`)}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="flex flex-wrap items-center gap-6">
          <HourRing hours={day.totalHours} target={target} />
          <div className="min-w-[200px] flex-1 space-y-2">
            <p className="text-lg font-semibold">{day.hitTarget ? "8-hour target reached 🎉" : "Hours remaining toward 8 ⏳"}</p>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
            </div>
            <p className="text-sm text-muted-foreground">
              {day.tasks.length} work items · {day.totalHours.toFixed(1)} / {target} hours
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-0 overflow-hidden rounded-md border border-border">
        {slots.map((task, index) => {
          const slot = index + 1;
          const tone = TICKET_COLORS[index % TICKET_COLORS.length];
          return (
            <TaskSlot
              key={`${day.date}-${slot}-${task?.id ?? "empty"}`}
              date={day.date}
              slot={slot}
              task={task}
              accent={tone.border}
              odd={index % 2 === 0}
              onRun={run}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setTaskDialogOpen(true)}>
          <Plus /> Add task
        </Button>
        <Dialog open={batchOpen} onOpenChange={setBatchOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary"><ListPlus /> Batch add</Button>
          </DialogTrigger>
          <DialogContent title="Add finished work">
            <p className="mb-2 text-sm text-muted-foreground">One item per line. Logged as complete with 1 hour each.</p>
            <Textarea value={batchText} onChange={(e) => setBatchText(e.target.value)} rows={8} />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBatchOpen(false)}>Cancel</Button>
              <Button
                disabled={pending}
                onClick={() =>
                  run("Added", async () => {
                    await batchAddTasks({ date: day.date, lines: batchText });
                    setBatchOpen(false);
                  })
                }
              >
                Add all
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="outline" onClick={() => void copyDayText()}>
          <Copy /> Copy day
        </Button>
        <Button variant="destructive" onClick={() => run("Cleared", () => clearDay(day.date))}>
          <Trash2 /> Clear
        </Button>
      </div>

      <Link href={`/month/${day.date.slice(0, 4)}/${Number(day.date.slice(5, 7))}`} className="text-sm text-primary">
        Open month board
      </Link>
    </div>
  );
}

function TaskSlot({
  date,
  slot,
  task,
  accent,
  odd,
  onRun,
}: {
  date: string;
  slot: number;
  task: TaskDTO | null;
  accent: string;
  odd: boolean;
  onRun: (label: string, fn: () => Promise<unknown>) => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [hours, setHours] = useState(task ? String(task.hours) : "");
  const persistRef = useRef(() => {});

  useEffect(() => {
    setTitle(task?.title ?? "");
    setHours(task ? String(task.hours) : "");
  }, [task?.id, task?.title, task?.hours]);

  persistRef.current = () => {
    const next = title.trim();
    if (!next) return;
    if (task && next === task.title) return;
    onRun("Saved", () =>
      task
        ? updateTask({ id: task.id, title: next })
        : upsertTask({ date, slotNumber: slot, title: next, hours: Number(hours) || 1 }),
    );
  };

  useEffect(() => {
    return () => {
      persistRef.current();
    };
  }, [date, slot]);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border p-3 last:border-b-0 sm:flex-row sm:flex-wrap sm:items-center",
        odd ? "sheet-odd" : "sheet-even",
      )}
      style={{ borderLeftWidth: 3, borderLeftColor: accent, color: "var(--foreground)" }}
    >
      <span className="w-16 shrink-0 font-mono text-xs font-semibold tracking-wide" style={{ color: "var(--foreground)" }}>
        TSK-{String(slot).padStart(2, "0")}
      </span>
      <Input
        className="min-w-0 flex-1 border-0 bg-transparent px-2 text-base shadow-none focus-visible:ring-0"
        value={title}
        placeholder=""
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => persistRef.current()}
      />
      <label className="flex items-center gap-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
        <Clock className="size-4" aria-hidden />
        <Input
          type="number"
          step="0.25"
          min="0"
          max="24"
          className="w-16 border-0 bg-transparent px-2 font-mono shadow-none focus-visible:ring-0"
          value={hours}
          aria-label="Hours"
          onChange={(e) => setHours(e.target.value)}
          onBlur={() => {
            if (!task) return;
            const next = Number(hours);
            if (Number.isNaN(next) || next === task.hours) return;
            onRun("Hours saved", () => updateTask({ id: task.id, hours: next }));
          }}
        />
      </label>
      {task ? (
        <Button
          size="icon"
          variant="ghost"
          aria-label="Delete task"
          onClick={() => {
            setTitle("");
            setHours("");
            onRun("Deleted", () => deleteTask(task.id));
          }}
        >
          <Trash2 />
        </Button>
      ) : null}
    </div>
  );
}
