"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV } from "@/config/navigation";
import { todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const today = todayISO();

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5">
        {MOBILE_NAV.map((item) => {
          const href = item.today ? `/day/${today}` : item.href;
          const isActive = item.today
            ? pathname.startsWith("/day")
            : item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.label}>
              <Link
                href={href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
