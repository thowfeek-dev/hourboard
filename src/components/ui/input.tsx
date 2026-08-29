import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-9 w-full appearance-none rounded-xs border border-input px-3 text-sm outline-none placeholder:text-[var(--placeholder)] focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full  appearance-none rounded-md border border-input px-3 py-2 text-sm outline-none placeholder:text-[var(--placeholder)] focus-visible:ring-1 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
