import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDays, getSettings, listProjects, listTags, recordExport } from "@/server/actions";
import { buildBackup, toCsv, toExcel, toPdf } from "@/lib/export";
import { computeStatistics } from "@/lib/stats";

export async function GET(request: Request) {
  await auth.protect();
  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "json";
  const start = url.searchParams.get("start") ?? "2024-01-01";
  const end = url.searchParams.get("end") ?? new Date().toISOString().slice(0, 10);
  const [settings, days, projects, tags] = await Promise.all([
    getSettings(),
    getDays(start, end),
    listProjects(),
    listTags(),
  ]);
  const stats = computeStatistics(days, settings, { start, end });
  const stamp = `${start}_${end}`;

  if (format === "csv") {
    const body = toCsv(days, stats, { start, end });
    await recordExport({ filename: `tasks_${stamp}.csv`, format: "csv", start, end, size: body.length });
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="tasks_${stamp}.csv"`,
      },
    });
  }

  if (format === "xlsx") {
    const bytes = toExcel(days, stats);
    await recordExport({ filename: `tasks_${stamp}.xlsx`, format: "xlsx", start, end, size: bytes.byteLength });
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="tasks_${stamp}.xlsx"`,
      },
    });
  }

  if (format === "pdf") {
    const buffer = toPdf(days, stats, { start, end });
    await recordExport({ filename: `tasks_${stamp}.pdf`, format: "pdf", start, end, size: buffer.byteLength });
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="tasks_${stamp}.pdf"`,
      },
    });
  }

  const json = JSON.stringify(buildBackup(settings, days, { projects, tags }), null, 2);
  await recordExport({ filename: `tasks_${stamp}.json`, format: "json", start, end, size: json.length });
  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="tasks_${stamp}.json"`,
    },
  });
}
