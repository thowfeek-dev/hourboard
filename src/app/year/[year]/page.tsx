import { YearView } from "@/components/calendar/year-view";
import { getYearData } from "@/server/actions";

export const dynamic = "force-dynamic";

export default async function YearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const data = await getYearData(Number(year));
  return <YearView year={Number(year)} days={data.days} settings={data.settings} stats={data.stats} />;
}
