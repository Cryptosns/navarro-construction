export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024; // 4 MB

export type UploadedDocumentFile = {
  storagePath: string;
  sizeBytes: number;
  mimeType: string;
};

export async function uploadDocumentFile(file: File): Promise<UploadedDocumentFile> {
  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new Error("El archivo es muy grande. Máximo 4 MB.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/documents/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error((data.error as string) ?? "Error al subir archivo.");
  }

  return data as UploadedDocumentFile;
}
