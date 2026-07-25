import { createAdminClient } from "@/lib/supabase/admin";

export const DOCUMENTS_BUCKET = "documents";
export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024; // 4 MB (límite Vercel)

function safeFileName(name: string): string {
  return name.replace(/[^\w.\-() ]+/g, "_").replace(/\s+/g, "_");
}

let bucketReady = false;

export async function ensureDocumentsBucket() {
  if (bucketReady) return;

  const admin = createAdminClient();
  const { data: buckets, error: listError } = await admin.storage.listBuckets();

  if (listError) {
    throw new Error(`Storage no disponible: ${listError.message}`);
  }

  const exists = buckets?.some((b) => b.name === DOCUMENTS_BUCKET);
  if (!exists) {
    const { error } = await admin.storage.createBucket(DOCUMENTS_BUCKET, {
      public: false,
      fileSizeLimit: MAX_DOCUMENT_BYTES,
    });
    if (error && !error.message.includes("already exists")) {
      throw new Error(`No se pudo crear el bucket: ${error.message}`);
    }
  }

  bucketReady = true;
}

export async function uploadDocumentAdmin(
  userId: string,
  file: File,
): Promise<{ storagePath: string; sizeBytes: number; mimeType: string }> {
  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new Error("El archivo es muy grande. Máximo 4 MB.");
  }

  await ensureDocumentsBucket();

  const storagePath = `${userId}/${Date.now()}-${safeFileName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const admin = createAdminClient();

  const { error } = await admin.storage.from(DOCUMENTS_BUCKET).upload(storagePath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    storagePath,
    sizeBytes: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}

export async function removeDocumentAdmin(storagePath: string) {
  if (!storagePath) return;
  const admin = createAdminClient();
  await admin.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
}

export async function signedDocumentUrlAdmin(
  storagePath: string,
  expiresIn = 3600,
): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "No se pudo generar enlace de descarga.");
  }

  return data.signedUrl;
}
