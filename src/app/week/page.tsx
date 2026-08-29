import { redirect } from "next/navigation";
import { isoWeekRef, todayISO } from "@/lib/dates";

export default function WeekIndex() {
  const { year, week } = isoWeekRef(todayISO());
  redirect(`/week/${year}/${week}`);
}
