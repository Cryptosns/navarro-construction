"use server";

import { createClient } from "@/lib/supabase/server";
import { seedDemoData } from "@/lib/data/queries";
import { revalidatePath } from "next/cache";

export async function seedDatabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated." };
  }

  const result = await seedDemoData(supabase, user.id);

  if (result.ok) {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");
    revalidatePath("/dashboard/clients");
  }

  return result;
}
