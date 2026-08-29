export function HourRing({ hours, target }: { hours: number; target: number }) {
  const pct = Math.min(100, Math.round((hours / Math.max(target, 0.1)) * 100));
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = c - (pct / 100) * c;
  return (
    <div className="relative grid place-items-center">
      <svg viewBox="0 0 140 140" className="size-32 -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" className="text-border" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="url(#ring)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dash}
        />
        <defs>
          <linearGradient id="ring" x1="0" x2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-semibold tabular-nums">{hours.toFixed(1)}h</p>
        <p className="text-xs text-muted-foreground">of {target}h 🎯</p>
      </div>
    </div>
  );
}

export const TICKET_COLORS = [
  { border: "#818cf8", label: "var(--ticket-1-label)", bg: "var(--ticket-1-bg)" },
  { border: "#22d3ee", label: "var(--ticket-2-label)", bg: "var(--ticket-2-bg)" },
  { border: "#34d399", label: "var(--ticket-3-label)", bg: "var(--ticket-3-bg)" },
  { border: "#fbbf24", label: "var(--ticket-4-label)", bg: "var(--ticket-4-bg)" },
  { border: "#f472b6", label: "var(--ticket-5-label)", bg: "var(--ticket-5-bg)" },
  { border: "#a78bfa", label: "var(--ticket-6-label)", bg: "var(--ticket-6-bg)" },
];

export const CHART_COLORS = ["#818cf8", "#22d3ee", "#34d399", "#fbbf24", "#f472b6", "#a78bfa", "#4ade80"];

export const CHART_THEME = {
  grid: "var(--chart-grid)",
  tick: { fill: "var(--chart-tick)", fontSize: 12 },
  axis: "var(--chart-axis)",
  line: "var(--chart-line)",
  line2: "var(--chart-line-2)",
  line3: "var(--chart-line-3)",
  tooltip: {
    backgroundColor: "var(--chart-tooltip-bg)",
    border: "1px solid var(--chart-tooltip-border)",
    color: "var(--chart-tooltip-fg)",
    borderRadius: 8,
  },
  cursor: { fill: "var(--chart-cursor)" },
};

export function heatClass(hours: number, target: number) {
  if (hours <= 0) return "heat-0";
  const ratio = hours / Math.max(target, 0.1);
  if (ratio < 0.4) return "heat-1";
  if (ratio < 0.75) return "heat-2";
  if (ratio < 1) return "heat-3";
  return "heat-4";
}
