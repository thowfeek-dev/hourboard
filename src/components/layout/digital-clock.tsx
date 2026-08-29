"use client";

import { useEffect, useState } from "react";

function formatTime(date: Date, timeFormat: "12h" | "24h") {
  const hour24 = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  if (timeFormat === "12h") {
    const hour = hour24 % 12 || 12;
    const meridiem = hour24 >= 12 ? "PM" : "AM";
    return `${String(hour).padStart(2, "0")}:${minutes}:${seconds} ${meridiem}`;
  }
  return `${String(hour24).padStart(2, "0")}:${minutes}:${seconds}`;
}

export function DigitalClock({ timeFormat }: { timeFormat: "12h" | "24h" }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const label = now ? formatTime(now, timeFormat) : "--:--:--";

  return (
    <time
      dateTime={now?.toISOString()}
      aria-live="off"
      aria-label="Current time"
      className="font-mono text-xs tabular-nums tracking-wide text-foreground sm:text-sm"
    >
      {label}
    </time>
  );
}
