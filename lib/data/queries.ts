import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project } from "@/lib/types";
import { projects as mockProjects } from "@/lib/mock-data";

type DbProject = {
  id: string;
  name: string;
  location: string;
  status: Project["status"];
  progress: number;
  budget: number;
  spent: number;
  deadline: string | null;
  team_size: number;
};

function mapProject(row: DbProject): Project {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    status: row.status,
    progress: row.progress,
    budget: Number(row.budget),
    spent: Number(row.spent),
    deadline: row.deadline ?? new Date().toISOString().split("T")[0],
    teamSize: row.team_size,
  };
}

export async function getProjects(
  supabase: SupabaseClient,
): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return mockProjects;
  if (!data?.length) return [];
  return (data as DbProject[]).map(mapProject);
}

export async function seedDemoData(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ ok: boolean; message: string }> {
  const { count } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) {
    return { ok: false, message: "You already have projects in the database." };
  }

  const projectRows = mockProjects.map((p) => ({
    user_id: userId,
    name: p.name,
    location: p.location,
    status: p.status,
    progress: p.progress,
    budget: p.budget,
    spent: p.spent,
    deadline: p.deadline,
    team_size: p.teamSize,
  }));

  const { error: projectError } = await supabase
    .from("projects")
    .insert(projectRows);

  if (projectError) {
    return { ok: false, message: projectError.message };
  }

  return { ok: true, message: "Demo data imported successfully." };
}
