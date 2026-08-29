import { ProjectsView } from "@/components/projects/projects-view";
import { listProjects, listTags } from "@/server/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const [projects, tags] = await Promise.all([listProjects(), listTags()]);
  return <ProjectsView projects={projects} tags={tags} />;
}
