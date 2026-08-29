"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

export function AppFrame({
  children,
  signedIn,
  currentDate,
  timeFormat,
}: {
  children: React.ReactNode;
  signedIn: boolean;
  currentDate: string;
  timeFormat: "12h" | "24h";
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  if (!signedIn || isAuthRoute) return children;
  return (
    <AppShell currentDate={currentDate} timeFormat={timeFormat}>
      {children}
    </AppShell>
  );
}
