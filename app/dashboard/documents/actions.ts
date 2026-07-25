"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const BUCKET = "documents";

function revalidateDocumentPages() {
  revalidatePath("/dashboard/documents");
}

function parseForm(formData: FormData) {
  return {
    id: (formData.get("id") as string) || null,
    name: (formData.get("name") as string) ?? "",
    project: (formData.get("project") as string) ?? "",
    type: (formData.get("type") as string) ?? "reporte",
    notes: (formData.get("notes") as string) ?? "",
    file: formData.get("file") as File | null,
  };
}

async function uploadFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
): Promise<{ path: string | null; sizeBytes: number; mimeType: string }> {
  if (!file.size) {
    return { path: null, sizeBytes: 0, mimeType: file.type || "application/octet-stream" };
  }

  const path = `${userId}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) return { path: null, sizeBytes: file.size, mimeType: file.type };

  return {
    path,
    sizeBytes: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}

async function removeStorageFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storagePath?: string | null,
) {
  if (!storagePath) return;
  await supabase.storage.from(BUCKET).remove([storagePath]);
}

export async function saveDocument(
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Debes iniciar sesión." };

  const parsed = parseForm(formData);
  if (!parsed.name.trim()) return { ok: false, message: "El nombre es obligatorio." };

  let storagePath: string | null = null;
  let sizeBytes: number | null = null;
  let mimeType: string | null = null;

  if (parsed.file?.size) {
    const uploaded = await uploadFile(supabase, user.id, parsed.file);
    if (!uploaded.path) {
      return {
        ok: false,
        message:
          "No se pudo subir el archivo. Crea el bucket 'documents' en Supabase Storage.",
      };
    }
    storagePath = uploaded.path;
    sizeBytes = uploaded.sizeBytes;
    mimeType = uploaded.mimeType;
  }

  const row = {
    name: parsed.name.trim(),
    project: parsed.project.trim(),
    type: parsed.type,
    notes: parsed.notes.trim(),
    updated_at: new Date().toISOString(),
    ...(storagePath
      ? { storage_path: storagePath, size_bytes: sizeBytes, mime_type: mimeType }
      : {}),
  };

  if (parsed.id) {
    if (storagePath) {
      const { data: existing } = await supabase
        .from("documents")
        .select("storage_path")
        .eq("id", parsed.id)
        .eq("user_id", user.id)
        .single();

      await removeStorageFile(supabase, existing?.storage_path);
    }

    const { error } = await supabase
      .from("documents")
      .update(row)
      .eq("id", parsed.id)
      .eq("user_id", user.id);

    if (error) return { ok: false, message: error.message };
    revalidateDocumentPages();
    return { ok: true, message: "Documento actualizado." };
  }

  const { error } = await supabase.from("documents").insert({
    user_id: user.id,
    ...row,
  });

  if (error) {
    return {
      ok: false,
      message: error.message.includes("relation")
        ? "Ejecuta el SQL de documents en supabase/schema.sql primero."
        : error.message,
    };
  }

  revalidateDocumentPages();
  return { ok: true, message: "Documento guardado." };
}

export async function deleteDocument(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Debes iniciar sesión." };

  const { data: existing } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };

  await removeStorageFile(supabase, existing?.storage_path);
  revalidateDocumentPages();
  return { ok: true, message: "Documento eliminado." };
}

export async function getDocumentDownloadUrl(
  id: string,
): Promise<{ ok: boolean; url?: string; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Debes iniciar sesión." };

  const { data, error } = await supabase
    .from("documents")
    .select("storage_path, name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data?.storage_path) {
    return { ok: false, message: "Este documento no tiene archivo adjunto." };
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(data.storage_path, 3600);

  if (signError || !signed?.signedUrl) {
    return { ok: false, message: "No se pudo generar el enlace de descarga." };
  }

  return { ok: true, url: signed.signedUrl };
}

export async function seedDocuments(): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Debes iniciar sesión." };

  const { count } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) {
    return { ok: false, message: "Ya tienes documentos en la base de datos." };
  }

  const { documents } = await import("@/lib/mock-data");
  const rows = documents.map((doc) => ({
    user_id: user.id,
    name: doc.name,
    project: doc.project,
    type: doc.type,
    notes: "",
    size_bytes: null,
  }));

  const { error } = await supabase.from("documents").insert(rows);
  if (error) return { ok: false, message: error.message };

  revalidateDocumentPages();
  return { ok: true, message: "Documentos demo importados." };
}
