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
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    throw new Error("Sesión expirada. Cierra sesión y vuelve a entrar.");
  }

  const user = session.user;

  const storagePath = `${user.id}/${Date.now()}-${safeFileName(file.name)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("row-level security") || msg.includes("policy")) {
      throw new Error(
        "Permisos de Storage faltantes. En Supabase → SQL Editor ejecuta el archivo supabase/documents-storage.sql (copia todo el script y Run).",
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
