"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { ProjectCard } from "@/components/dashboard/project-card";
import { ProjectFormDialog } from "@/components/dashboard/project-form-dialog";
import { deleteProject } from "@/app/dashboard/projects/actions";

type ProjectsListProps = {
  projects: Project[];
  usingMockData?: boolean;
};

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );
}

export function ProjectsList({ projects, usingMockData }: ProjectsListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [mode, setMode] = useState<"create" | "edit">("create");

  function openCreate() {
    setMode("create");
    setEditingProject(undefined);
    setDialogOpen(true);
  }

  function openEdit(project: Project) {
    if (!isUuid(project.id)) {
      alert(
        "These are demo projects. Go to Settings → Import demo data to Supabase, then you can edit them.",
      );
      return;
    }
    setMode("edit");
    setEditingProject(project);
    setDialogOpen(true);
  }

  async function handleDelete(project: Project) {
    if (!isUuid(project.id)) {
      alert("Import demo data to Supabase first (Settings page).");
      return;
    }
    if (!confirm(`Delete "${project.name}"?`)) return;
    await deleteProject(project.id);
  }

  return (
    <>
      {usingMockData && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Showing demo data. To edit from the app, go to{" "}
          <strong>Settings → Import demo data to Supabase</strong>, or create a
          new project with the button above.
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button
          onClick={openCreate}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
        >
          + New project
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <div key={project.id} className="relative">
            <ProjectCard project={project} />
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => openEdit(project)}
                className="flex-1 rounded-lg border border-zinc-200 bg-white py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(project)}
                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <ProjectFormDialog
        key={editingProject?.id ?? "new"}
        open={dialogOpen}
        mode={mode}
        project={editingProject}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
