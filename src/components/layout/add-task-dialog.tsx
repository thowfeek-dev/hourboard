"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { addTask } from "@/server/actions";
import { todayISO } from "@/lib/dates";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function dateFromPath(pathname: string) {
  const match = pathname.match(/^\/day\/(\d{4}-\d{2}-\d{2})$/);
  return match?.[1] ?? todayISO();
}

export function AddTaskDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const open = useUiStore((s) => s.taskDialogOpen);
  const setOpen = useUiStore((s) => s.setTaskDialogOpen);
  const [pending, startTransition] = useTransition();
  const [date, setDate] = useState(todayISO());
  const [title, setTitle] = useState("");
  const [hours, setHours] = useState("1");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) setDate(dateFromPath(pathname));
  }, [open, pathname]);

  function reset() {
    setDate(todayISO());
    setTitle("");
    setHours("1");
    setNotes("");
  }

  function submit() {
    const nextTitle = title.trim();
    if (!nextTitle) {
      toast.error("Add a task title");
      return;
    }
    const nextHours = Number(hours);
    startTransition(async () => {
      try {
        await addTask({
          date,
          title: nextTitle,
          hours: Number.isFinite(nextHours) ? nextHours : 1,
          notes: notes.trim() || undefined,
        });
        toast.success("Task added");
        setOpen(false);
        reset();
        router.push(`/day/${date}`);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not add task");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setDate(dateFromPath(pathname));
      }}
    >
      <DialogContent title="Add task">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="add-task-title">Title</Label>
            <Input
              id="add-task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you finish?"
              autoFocus
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="add-task-date">Date</Label>
              <Input id="add-task-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-task-hours">Hours</Label>
              <Input
                id="add-task-hours"
                type="number"
                min="0"
                max="24"
                step="0.25"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-task-notes">Notes</Label>
            <Textarea
              id="add-task-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional context"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              Add task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
