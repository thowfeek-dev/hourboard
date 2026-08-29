"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS, CHART_THEME } from "@/components/charts/hour-ring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsCharts({
  weekday,
  hours,
  trend,
  monthly,
  projects,
  tags,
  priority,
}: {
  weekday: { name: string; hours: number }[];
  hours: { name: string; value: number }[];
  trend: { date: string; hours: number; avg7: number; avg30: number }[];
  monthly: { month: string; hours: number }[];
  projects: { name: string; hours: number; tasks: number }[];
  tags: { name: string; hours: number; tasks: number }[];
  priority: { name: string; value: number }[];
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Hours over time</CardTitle>
        </CardHeader>
        <CardContent className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis dataKey="date" hide />
              <YAxis tick={CHART_THEME.tick} stroke={CHART_THEME.axis} width={36} />
              <Tooltip contentStyle={CHART_THEME.tooltip} />
              <Legend />
              <Area type="monotone" dataKey="hours" stroke={CHART_THEME.line} fill={CHART_THEME.line} fillOpacity={0.2} name="Hours" />
              <Area type="monotone" dataKey="avg7" stroke={CHART_THEME.line2} fill={CHART_THEME.line2} fillOpacity={0.08} name="7-day avg" />
              <Area type="monotone" dataKey="avg30" stroke={CHART_THEME.line3} fill={CHART_THEME.line3} fillOpacity={0.06} name="30-day avg" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hours by month</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {monthly.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                  <XAxis dataKey="month" tick={CHART_THEME.tick} stroke={CHART_THEME.axis} />
                  <YAxis tick={CHART_THEME.tick} stroke={CHART_THEME.axis} width={36} />
                  <Tooltip contentStyle={CHART_THEME.tooltip} cursor={CHART_THEME.cursor} />
                  <Bar dataKey="hours" name="Hours" radius={[8, 8, 0, 0]} fill={CHART_THEME.line} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Priority mix</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {priority.some((row) => row.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={priority} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88} paddingAngle={3}>
                    {priority.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_THEME.tooltip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hours by weekday</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={weekday}>
                <PolarGrid stroke={CHART_THEME.grid} />
                <PolarAngleAxis dataKey="name" tick={CHART_THEME.tick} />
                <PolarRadiusAxis tick={CHART_THEME.tick} stroke={CHART_THEME.axis} />
                <Radar dataKey="hours" stroke={CHART_THEME.line} fill={CHART_THEME.line} fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>How long were the days?</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hours}>
                <XAxis dataKey="name" tick={CHART_THEME.tick} stroke={CHART_THEME.axis} />
                <YAxis tick={CHART_THEME.tick} stroke={CHART_THEME.axis} width={36} />
                <Tooltip contentStyle={CHART_THEME.tooltip} cursor={CHART_THEME.cursor} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {hours.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hours by project</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {projects.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projects} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <XAxis type="number" tick={CHART_THEME.tick} stroke={CHART_THEME.axis} />
                  <YAxis type="category" dataKey="name" width={88} tick={CHART_THEME.tick} stroke={CHART_THEME.axis} />
                  <Tooltip contentStyle={CHART_THEME.tooltip} cursor={CHART_THEME.cursor} />
                  <Bar dataKey="hours" name="Hours" radius={[0, 8, 8, 0]} fill={CHART_COLORS[1]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Assign projects to tasks to see this chart." />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hours by tag</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {tags.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tags} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <XAxis type="number" tick={CHART_THEME.tick} stroke={CHART_THEME.axis} />
                  <YAxis type="category" dataKey="name" width={88} tick={CHART_THEME.tick} stroke={CHART_THEME.axis} />
                  <Tooltip contentStyle={CHART_THEME.tooltip} cursor={CHART_THEME.cursor} />
                  <Bar dataKey="hours" name="Hours" radius={[0, 8, 8, 0]} fill={CHART_COLORS[2]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Add tags on tasks to see this chart." />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function EmptyChart({ label = "No data in this range yet." }: { label?: string }) {
  return <p className="grid h-full place-items-center text-sm text-muted-foreground">{label}</p>;
}
