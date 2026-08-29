import { SettingsView } from "@/components/settings/settings-view";
import { getSettings } from "@/server/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await getSettings();
  return <SettingsView settings={settings} />;
}
