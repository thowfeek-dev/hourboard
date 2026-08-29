"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@radix-ui/react-dialog";
import { searchTasks } from "@/server/actions";
import { useUiStore } from "@/stores/ui-store";
import { DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { TaskDTO } from "@/types";

export function SearchDialog() {
  const open = useUiStore((s) => s.searchOpen);
  const setOpen = useUiStore((s) => s.setSearchOpen);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TaskDTO[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setResults(await searchTasks(query));
    }, 180);
    return () => clearTimeout(timer);
  }, [query, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent title="Search tasks">
        <Input
          autoFocus
          placeholder="Search finished work"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="mt-4 max-h-72 space-y-1 overflow-auto">
          {results.map((task) => (
            <li key={task.id}>
              <button
                className="w-full rounded-md px-3 py-2 text-left hover:bg-secondary"
                onClick={() => {
                  setOpen(false);
                  router.push(`/day/${task.date}`);
                }}
              >
                <div className="text-sm font-medium">{task.title}</div>
                <div className="text-xs text-muted-foreground">
                  {task.date} · slot {task.slotNumber}
                </div>
              </button>
            </li>
          ))}
          {query.length >= 2 && results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">No matches</li>
          ) : null}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
