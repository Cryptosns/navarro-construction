"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ProjectStatus } from "@/lib/types";

export type ProjectFormData = {
  name: string;
  location: string;
  status: ProjectStatus;
  progress: number;
  budget: number;
  spent: number;
  deadline: string;
  teamSize: number;
};

function revalidateProjectPages() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
}

export async function createProject(
  data: ProjectFormData,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be logged in." };
  }

  if (!data.name.trim()) {
    return { ok: false, message: "Project name is required." };
  }

  const { error } = await supabase.from("projects").insert({
    user_id: user.id,
    name: data.name.trim(),
    location: data.location.trim(),
    status: data.status,
    progress: data.progress,
    budget: data.budget,
    spent: data.spent,
    deadline: data.deadline || null,
    team_size: data.teamSize,
  });

  if (error) {
    return {
      ok: false,
      message:
        error.message.includes("relation")
          ? "Run supabase/schema.sql in Supabase first."
          : error.message,
    };
  }

  revalidateProjectPages();
  return { ok: true, message: "Project created." };
}

export async function updateProject(
  id: string,
  data: ProjectFormData,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be logged in." };
  }

  if (!data.name.trim()) {
    return { ok: false, message: "Project name is required." };
  }

  const { error } = await supabase
    .from("projects")
    .update({
      name: data.name.trim(),
      location: data.location.trim(),
      status: data.status,
      progress: data.progress,
      budget: data.budget,
      spent: data.spent,
      deadline: data.deadline || null,
      team_size: data.teamSize,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateProjectPages();
  return { ok: true, message: "Project updated." };
}

export async function deleteProject(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be logged in." };
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateProjectPages();
  return { ok: true, message: "Project deleted." };
}
