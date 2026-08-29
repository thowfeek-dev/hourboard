"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Menu, Moon, Plus, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { NAV } from "@/config/navigation";
import { isoWeekRef, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { AddTaskDialog } from "@/components/layout/add-task-dialog";
import { DigitalClock } from "@/components/layout/digital-clock";
import { KeyboardShortcuts } from "@/components/layout/shortcuts";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchDialog } from "@/components/layout/search-dialog";

export function AppShell({
  children,
  currentDate,
  timeFormat,
}: {
  children: React.ReactNode;
  currentDate: string;
  timeFormat: "12h" | "24h";
}) {
  const pathname = usePathname();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const setTaskDialogOpen = useUiStore((s) => s.setTaskDialogOpen);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (window.innerWidth >= 768) setSidebarOpen(true);
  }, [setSidebarOpen]);
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);
  const year = currentDate.slice(0, 4);
  const month = Number(currentDate.slice(5, 7));
  const week = isoWeekRef(currentDate);

  function navClick() {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }

  return (
    <div className="relative z-10 min-h-screen bg-background text-foreground">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-card focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle navigation" className="size-11 sm:size-9">
            <Menu />
          </Button>
          <Link href="/" className="gradient-text shrink-0 text-sm font-semibold tracking-tight">
            Hourboard
          </Link>
          <button
            onClick={() => setSearchOpen(true)}
            className="ml-2 hidden h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-left text-sm text-muted-foreground lg:flex"
          >
            Search work
            <kbd className="ml-auto font-mono text-[10px]">Ctrl F</kbd>
          </button>
          <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
            <div className="hidden sm:block">
              <DigitalClock timeFormat={timeFormat} />
            </div>
            <Link href={`/year/${year}`} className="hidden text-sm text-muted-foreground lg:block">
              {year}
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="size-11 lg:hidden" aria-label="Search">
              <Search />
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-11 px-3 sm:h-8"
              onClick={() => setTaskDialogOpen(true)}
            >
              <Plus />
              <span className="hidden sm:inline">Add task</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-11 sm:size-9"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {mounted && resolvedTheme === "dark" ? <Sun /> : <Moon />}
            </Button>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-9",
                },
              }}
            />
          </div>
        </div>
      </header>
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <div className="flex">
        <aside
          className={cn(
            "z-40 border-r border-border bg-background p-3 transition-transform duration-200 md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:shrink-0 md:transition-[width]",
            "fixed inset-y-0 left-0 top-14 w-64 overflow-y-auto pb-[env(safe-area-inset-bottom)] md:pb-3",
            sidebarOpen ? "translate-x-0 md:w-60" : "-translate-x-full md:w-0 md:overflow-hidden md:border-0 md:p-0 md:translate-x-0",
          )}
        >
          <nav aria-label="Primary" className="space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={navClick}
                  className={cn(
                    "lift flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted md:min-h-0",
                    active && "bg-secondary text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
            <p className="px-3 pt-4 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Calendar</p>
            <Link
              href={`/day/${currentDate}`}
              onClick={navClick}
              className={cn("lift flex min-h-11 items-center rounded-md px-3 py-2 text-sm hover:bg-secondary md:min-h-0", pathname.startsWith("/day") && "bg-secondary")}
            >
              Day
            </Link>
            <Link
              href={`/week/${week.year}/${week.week}`}
              onClick={navClick}
              className={cn("lift flex min-h-11 items-center rounded-md px-3 py-2 text-sm hover:bg-secondary md:min-h-0", pathname.startsWith("/week") && "bg-secondary")}
            >
              Week
            </Link>
            <Link
              href={`/month/${year}/${month}`}
              onClick={navClick}
              className={cn("lift flex min-h-11 items-center rounded-md px-3 py-2 text-sm hover:bg-secondary md:min-h-0", pathname.startsWith("/month") && "bg-secondary")}
            >
              Month
            </Link>
            <Link
              href={`/year/${year}`}
              onClick={navClick}
              className={cn("lift flex min-h-11 items-center rounded-md px-3 py-2 text-sm hover:bg-secondary md:min-h-0", pathname.startsWith("/year") && "bg-secondary")}
            >
              Year
            </Link>
          </nav>
        </aside>
        <main id="main" className="min-w-0 flex-1 px-3 py-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-4 md:px-8 md:py-6 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
      <SearchDialog />
      <AddTaskDialog />
      <KeyboardShortcuts currentDate={currentDate} />
    </div>
  );
}
