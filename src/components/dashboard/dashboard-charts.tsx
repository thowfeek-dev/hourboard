"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS, CHART_THEME } from "@/components/charts/hour-ring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Statistics } from "@/types";

export function DashboardCharts({
  chartData,
  weekdayBars,
}: {
  chartData: { date: string; hours: number; ma7: number; ma30: number }[];
  weekdayBars: { name: string; hours: number }[];
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>📈 Hours over time</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis dataKey="date" hide />
              <YAxis tick={CHART_THEME.tick} stroke={CHART_THEME.axis} />
              <Tooltip contentStyle={CHART_THEME.tooltip} />
              <Legend wrapperStyle={{ color: "var(--chart-tick)" }} />
              <Line type="monotone" dataKey="hours" stroke={CHART_THEME.line} strokeWidth={2} dot={false} name="Hours" />
              <Line type="monotone" dataKey="ma7" stroke={CHART_THEME.line2} strokeWidth={2} dot={false} name="7-day" />
              <Line type="monotone" dataKey="ma30" stroke={CHART_THEME.line3} strokeWidth={2} dot={false} name="30-day" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>🌈 Weekday hours</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekdayBars}>
              <XAxis dataKey="name" tick={CHART_THEME.tick} stroke={CHART_THEME.axis} />
              <YAxis tick={CHART_THEME.tick} stroke={CHART_THEME.axis} />
              <Tooltip contentStyle={CHART_THEME.tooltip} cursor={CHART_THEME.cursor} />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {weekdayBars.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
