import { createClient } from "@/lib/supabase/client";

const BUCKET = "documents";
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10 MB

export type UploadedDocumentFile = {
  storagePath: string;
  sizeBytes: number;
  mimeType: string;
};

function safeFileName(name: string): string {
  return name.replace(/[^\w.\-() ]+/g, "_").replace(/\s+/g, "_");
}

export async function uploadDocumentFile(file: File): Promise<UploadedDocumentFile> {
  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new Error("El archivo es muy grande. Máximo 10 MB.");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Debes iniciar sesión.");
  }

  const storagePath = `${user.id}/${Date.now()}-${safeFileName(file.name)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    if (error.message.includes("row-level security")) {
      throw new Error(
        "Permisos de Storage faltantes. Ejecuta supabase/documents-storage.sql en Supabase.",
      );
    }
    if (error.message.includes("Bucket not found")) {
      throw new Error("Crea el bucket 'documents' en Supabase Storage.");
    }
    throw new Error(error.message);
  }

  return {
    storagePath,
    sizeBytes: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}
