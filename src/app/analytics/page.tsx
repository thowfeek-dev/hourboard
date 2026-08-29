import { AnalyticsView } from "@/components/analytics/analytics-view";
import { getDashboardData } from "@/server/actions";
import { todayISO } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const data = await getDashboardData("2024-01-01", todayISO());
  return <AnalyticsView stats={data.stats} />;
}
