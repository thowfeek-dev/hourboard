import { redirect } from "next/navigation";
import { todayISO } from "@/lib/dates";

export default function MonthIndex() {
  const today = todayISO();
  redirect(`/month/${today.slice(0, 4)}/${Number(today.slice(5, 7))}`);
}
