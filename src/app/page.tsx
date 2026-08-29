import { auth, currentUser } from "@clerk/nextjs/server";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { LandingPage } from "@/components/marketing/landing-page";
import { todayISO } from "@/lib/dates";
import { isClerkConfigured } from "@/lib/clerk";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  let userId: string | null = null;
  if (isClerkConfigured()) {
    try {
      userId = (await auth()).userId;
    } catch {
      userId = null;
    }
  }
  if (!userId) return <LandingPage />;

  const params = await searchParams;
  const end = params.end ?? todayISO();
  const start = params.start ?? `${end.slice(0, 4)}-01-01`;
  const { getDashboardData } = await import("@/server/actions");
  const [data, user] = await Promise.all([getDashboardData(start, end), currentUser()]);
  return (
    <DashboardView
      stats={data.stats}
      settings={data.settings}
      days={data.days}
      recent={data.recent}
      year={Number(end.slice(0, 4))}
      firstName={user?.firstName ?? null}
    />
  );
}
