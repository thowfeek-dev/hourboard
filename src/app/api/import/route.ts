import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { importBackup } from "@/server/actions";
import { parseCsv } from "@/lib/csv";

export async function POST(request: Request) {
  await auth.protect();
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") === "replace" ? "replace" : "merge";
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  const text = await file.text();
  const payload = file.name.endsWith(".csv")
    ? { months: groupDays(parseCsv(text)) }
    : JSON.parse(text);
  await importBackup(payload, mode);
  return NextResponse.json({ ok: true });
}

function groupDays(days: { date: string }[]) {
  const months: Record<string, { days: typeof days }> = {};
  for (const day of days) {
    const key = day.date.slice(0, 7);
    months[key] ??= { days: [] };
    months[key].days.push(day);
  }
  return months;
}
