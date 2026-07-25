"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const BUCKET = "documents";

export type SaveDocumentInput = {
  id?: string | null;
  name: string;
  project: string;
  type: string;
  notes: string;
  storagePath?: string | null;
  sizeBytes?: number | null;
  mimeType?: string | null;
};

function revalidateDocumentPages() {
  revalidatePath("/dashboard/documents");
}

async function removeStorageFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storagePath?: string | null,
) {
  if (!storagePath) return;
  await supabase.storage.from(BUCKET).remove([storagePath]);
}

export async function saveDocument(
  input: SaveDocumentInput,
): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { ok: false, message: "Debes iniciar sesión." };

    const name = input.name.trim();
    if (!name) return { ok: false, message: "El nombre es obligatorio." };

    const row = {
      name,
      project: input.project.trim(),
      type: input.type,
      notes: input.notes.trim(),
      updated_at: new Date().toISOString(),
      ...(input.storagePath
        ? {
            storage_path: input.storagePath,
            size_bytes: input.sizeBytes ?? null,
            mime_type: input.mimeType ?? null,
          }
        : {}),
    };

    if (input.id) {
      if (input.storagePath) {
        const { data: existing } = await supabase
          .from("documents")
          .select("storage_path")
          .eq("id", input.id)
          .eq("user_id", user.id)
          .single();

        if (existing?.storage_path && existing.storage_path !== input.storagePath) {
          await removeStorageFile(supabase, existing.storage_path);
        }
      }

      const { error } = await supabase
        .from("documents")
        .update(row)
        .eq("id", input.id)
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
      if (input.storagePath) {
        await removeStorageFile(supabase, input.storagePath);
      }
      return {
        ok: false,
        message: error.message.includes("relation")
          ? "Ejecuta el SQL de documents en supabase/schema.sql primero."
          : error.message,
      };
    }

    revalidateDocumentPages();
    return { ok: true, message: "Documento guardado." };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Error al guardar el documento.",
    };
  }
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
