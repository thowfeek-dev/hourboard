import { WeekView } from "@/components/calendar/week-view";
import { getWeekData } from "@/server/actions";

export const dynamic = "force-dynamic";

export default async function WeekPage({
  params,
}: {
  params: Promise<{ year: string; week: string }>;
}) {
  const { year, week } = await params;
  const data = await getWeekData(Number(year), Number(week));
  return (
    <WeekView
      year={Number(year)}
      week={Number(week)}
      bounds={data.bounds}
      days={data.days}
      settings={data.settings}
    />
  );
}
