import { redirect } from "next/navigation";
import { todayISO } from "@/lib/dates";

export default function YearIndex() {
  redirect(`/year/${todayISO().slice(0, 4)}`);
}
