import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectCard } from "@/components/dashboard/project-card";
import { projects } from "@/lib/mock-data";

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Manage all active and planned construction projects."
        action={
          <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600">
            + Nuevo proyecto
          </button>
        }
      />
      <main className="flex-1 overflow-auto p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>
    </>
  );
}
