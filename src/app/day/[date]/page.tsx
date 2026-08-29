import { notFound } from "next/navigation";
import { DayView } from "@/components/day/day-view";
import { parseDate } from "@/lib/dates";
import { getDay, getSettings } from "@/server/actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return { title: date };
}

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!parseDate(date)) notFound();
  const [day, settings] = await Promise.all([getDay(date), getSettings()]);
  return <DayView day={day} settings={settings} />;
}
