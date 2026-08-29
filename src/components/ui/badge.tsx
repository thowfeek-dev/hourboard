import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  ...props
}: React.ComponentProps<"span"> & { tone?: "default" | "high" | "medium" | "low" | "success" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        tone === "default" && "bg-secondary text-secondary-foreground",
        tone === "high" && "bg-destructive/15 text-destructive",
        tone === "medium" && "bg-warning/15 text-warning",
        tone === "low" && "bg-success/15 text-success",
        tone === "success" && "bg-success/15 text-success",
        className,
      )}
      {...props}
    />
  );
}
