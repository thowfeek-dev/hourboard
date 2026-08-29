import { MonthView } from "@/components/calendar/month-view";
import { getMonthData } from "@/server/actions";

export const dynamic = "force-dynamic";

export default async function MonthPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  const data = await getMonthData(Number(year), Number(month));
  return (
    <MonthView
      year={Number(year)}
      month={Number(month)}
      days={data.days}
      settings={data.settings}
      review={data.review}
    />
  );
}
