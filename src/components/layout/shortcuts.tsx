"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { todayISO, shiftDay } from "@/lib/dates";
import { useUiStore } from "@/stores/ui-store";

export function KeyboardShortcuts({ currentDate }: { currentDate: string }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const setTaskDialogOpen = useUiStore((s) => s.setTaskDialogOpen);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const meta = event.ctrlKey || event.metaKey;
      if (!meta) return;
      if (event.key.toLowerCase() === "n" && !event.shiftKey) {
        event.preventDefault();
        setTaskDialogOpen(true);
      }
      if (event.key === "f") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        router.push(`/day/${shiftDay(currentDate, -1)}`);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        router.push(`/day/${shiftDay(currentDate, 1)}`);
      }
      if (event.shiftKey && event.key.toLowerCase() === "t") {
        event.preventDefault();
        router.push(`/day/${todayISO()}`);
      }
      if (event.shiftKey && event.key.toLowerCase() === "m") {
        event.preventDefault();
        const [y, m] = currentDate.split("-");
        router.push(`/month/${y}/${Number(m)}`);
      }
      if (event.shiftKey && event.key.toLowerCase() === "y") {
        event.preventDefault();
        router.push(`/year/${currentDate.slice(0, 4)}`);
      }
      if (event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        router.push("/analytics");
      }
      if (event.shiftKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        router.push("/settings");
      }
      if (event.shiftKey && event.key.toLowerCase() === "e") {
        event.preventDefault();
        router.push("/import-export");
      }
      if (event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentDate, resolvedTheme, router, setSearchOpen, setTaskDialogOpen, setTheme]);

  return null;
}
