"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function revalidateReceiptPages() {
  revalidatePath("/dashboard/receipts");
}

function parseForm(formData: FormData) {
  return {
    id: (formData.get("id") as string) || null,
    vendor: (formData.get("vendor") as string) ?? "",
    project: (formData.get("project") as string) ?? "",
    amount: Number(formData.get("amount") ?? 0),
    category: (formData.get("category") as string) ?? "Materials",
    date: (formData.get("date") as string) ?? "",
    status: (formData.get("status") as "pending" | "approved" | "rejected") ?? "pending",
    file: formData.get("file") as File | null,
  };
}

async function uploadFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
): Promise<string | null> {
  if (!file.size) return null;

  const path = `${userId}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from("receipts").upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  return error ? file.name : path;
}

export async function saveReceipt(
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "You must be logged in." };

  const parsed = parseForm(formData);
  if (!parsed.vendor.trim()) return { ok: false, message: "Vendor is required." };

  let fileName: string | null = null;
  if (parsed.file?.size) {
    fileName = await uploadFile(supabase, user.id, parsed.file);
  }

  const row = {
    vendor: parsed.vendor.trim(),
    project: parsed.project.trim(),
    amount: parsed.amount,
    category: parsed.category.trim(),
    date: parsed.date || new Date().toISOString().split("T")[0],
    status: parsed.status,
    ...(fileName ? { file_name: fileName } : {}),
  };

  if (parsed.id) {
    const { error } = await supabase
      .from("receipts")
      .update(row)
      .eq("id", parsed.id)
      .eq("user_id", user.id);

    if (error) return { ok: false, message: error.message };
    revalidateReceiptPages();
    return { ok: true, message: "Receipt updated." };
  }

  const { error } = await supabase.from("receipts").insert({
    user_id: user.id,
    ...row,
  });

  if (error) {
    return {
      ok: false,
      message: error.message.includes("relation")
        ? "Run the receipts SQL in supabase/schema.sql first."
        : error.message,
    };
  }

  revalidateReceiptPages();
  return { ok: true, message: "Receipt saved." };
}

export async function deleteReceipt(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "You must be logged in." };

  const { error } = await supabase
    .from("receipts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidateReceiptPages();
  return { ok: true, message: "Receipt deleted." };
}

export async function seedReceipts(): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "You must be logged in." };

  const { count } = await supabase
    .from("receipts")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) {
    return { ok: false, message: "You already have receipts in the database." };
  }

  const { receipts } = await import("@/lib/mock-data");
  const rows = receipts.map((r) => ({
    user_id: user.id,
    vendor: r.vendor,
    project: r.project,
    amount: r.amount,
    category: r.category,
    date: r.date,
    status: r.status,
  }));

  const { error } = await supabase.from("receipts").insert(rows);
  if (error) return { ok: false, message: error.message };

  revalidateReceiptPages();
  return { ok: true, message: "Demo receipts imported." };
}
