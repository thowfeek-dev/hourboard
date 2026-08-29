"use client";

import { useState } from "react";
import { toast } from "sonner";
import { importBackup } from "@/server/actions";
import { parseCsv } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ExportHistoryDTO } from "@/types";

export function ImportExportView({ history }: { history: ExportHistoryDTO[] }) {
  const [format, setFormat] = useState("json");
  const [start, setStart] = useState("2024-01-01");
  const [end, setEnd] = useState("2026-08-23");
  const [preview, setPreview] = useState<{ date: string; tasks: number; hours: number }[]>([]);
  const [payload, setPayload] = useState<unknown>(null);

  async function download() {
    const res = await fetch(`/api/export?format=${format}&start=${start}&end=${end}`);
    if (!res.ok) {
      toast.error("Export failed");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = res.headers.get("content-disposition")?.split("filename=").at(-1)?.replaceAll('"', "") ?? `tasks.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download started");
  }

  async function onFile(file: File, mode: "merge" | "replace") {
    const text = await file.text();
    try {
      let data: unknown;
      if (file.name.endsWith(".csv")) {
        const days = parseCsv(text);
        data = { months: Object.fromEntries(days.map((day) => [day.date.slice(0, 7), { days: [day] }])) };
        setPreview(days.slice(0, 8).map((day) => ({ date: day.date, tasks: day.tasks.length, hours: day.totalHours })));
      } else {
        data = JSON.parse(text);
        const months = (data as { months?: Record<string, { days: { date: string; tasks: unknown[]; totalHours?: number }[] }> }).months ?? {};
        setPreview(
          Object.values(months)
            .flatMap((month) => month.days)
            .slice(0, 8)
            .map((day) => ({ date: day.date, tasks: day.tasks?.length ?? 0, hours: day.totalHours ?? 0 })),
        );
      }
      setPayload(data);
      await importBackup(data, mode);
      toast.success(mode === "replace" ? "Replaced all data" : "Merged import");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Data</p>
        <h1 className="text-2xl font-semibold tracking-tight">Import / Export</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Export</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {["pdf", "csv", "xlsx", "json"].map((item) => (
              <Button key={item} variant={format === item ? "default" : "outline"} onClick={() => setFormat(item)}>
                {item.toUpperCase()}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            <Button onClick={download}>Generate and download</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Import</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">JSON or CSV. Excel exports can be re-imported as CSV.</p>
          <Input
            type="file"
            accept=".json,.csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onFile(file, "merge");
            }}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const input = document.querySelector<HTMLInputElement>('input[type="file"]');
                const file = input?.files?.[0];
                if (file) void onFile(file, "replace");
                else toast.message("Choose a file first");
              }}
            >
              Replace all
            </Button>
          </div>
          {preview.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th>Date</th><th>Tasks</th><th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row) => (
                  <tr key={row.date} className="border-t border-border">
                    <td className="py-1">{row.date}</td>
                    <td>{row.tasks}</td>
                    <td>{row.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          {payload ? <p className="text-xs text-muted-foreground">Last parsed payload is ready for another replace if needed.</p> : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Export history</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {history.length === 0 ? <p className="text-muted-foreground">No exports yet.</p> : null}
          {history.map((row) => (
            <div key={row.id} className="flex flex-wrap justify-between gap-2 border-b border-border py-2">
              <span>{new Date(row.exportedAt).toLocaleString()}</span>
              <span className="font-mono">{row.filename}</span>
              <span>{(row.size / 1024).toFixed(1)} KB</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
