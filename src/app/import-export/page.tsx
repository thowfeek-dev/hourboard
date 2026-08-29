import { ImportExportView } from "@/components/io/import-export-view";
import { listExports } from "@/server/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Import / Export" };

export default async function ImportExportPage() {
  const history = await listExports();
  return <ImportExportView history={history} />;
}
