import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectsList } from "@/components/dashboard/projects-list";
import { createClient } from "@/lib/supabase/server";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const usingMockData = Boolean(error || !data?.length);

  const projects = usingMockData
    ? (await import("@/lib/mock-data")).projects
    : (data ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          location: row.location,
          status: row.status,
          progress: row.progress,
          budget: Number(row.budget),
          spent: Number(row.spent),
          deadline: row.deadline ?? new Date().toISOString().split("T")[0],
          teamSize: row.team_size,
        }));

  return (
    <>
      <PageHeader
        title="Projects"
        description="Create, edit and manage your construction projects."
      />
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <ProjectsList projects={projects} usingMockData={usingMockData} />
      </main>
    </>
  );
}
