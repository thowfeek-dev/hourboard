"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProject, createTag, deleteProject, deleteTag } from "@/server/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ProjectDTO, TagDTO } from "@/types";

export function ProjectsView({ projects, tags }: { projects: ProjectDTO[]; tags: TagDTO[] }) {
  const router = useRouter();
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight">Projects & tags</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full" style={{ background: project.color }} />
                  <div>
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.taskCount} tasks · {project.hours}h</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={async () => { await deleteProject(project.id); toast.success("Deleted"); router.refresh(); }}>
                  Delete
                </Button>
              </div>
            ))}
            <form
              className="grid gap-2"
              action={async (form) => {
                await createProject({
                  name: String(form.get("name")),
                  color: String(form.get("color") || "#6366f1"),
                  description: String(form.get("description") || ""),
                });
                toast.success("Project created");
                router.refresh();
              }}
            >
              <Input name="name" placeholder="New project" required />
              <Input name="color" type="color" defaultValue="#6366f1" />
              <Input name="description" placeholder="Description" />
              <Button type="submit">Add project</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  className="rounded-full border border-border px-3 py-1 text-xs"
                  style={{ borderColor: tag.color }}
                  onClick={async () => { await deleteTag(tag.id); router.refresh(); }}
                >
                  {tag.name} · {tag.taskCount}
                </button>
              ))}
            </div>
            <form
              className="grid gap-2"
              action={async (form) => {
                await createTag({ name: String(form.get("name")), color: String(form.get("color") || "#818cf8") });
                toast.success("Tag created");
                router.refresh();
              }}
            >
              <Input name="name" placeholder="New tag" required />
              <Input name="color" type="color" defaultValue="#818cf8" />
              <Button type="submit">Add tag</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
