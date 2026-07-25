import { createClient } from "@/lib/supabase/server";
import { uploadDocumentAdmin } from "@/lib/documents/storage-server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Debes iniciar sesión." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "Archivo requerido." }, { status: 400 });
    }

    const uploaded = await uploadDocumentAdmin(user.id, file);

    return Response.json(uploaded);
  } catch (err) {
    console.error("Document upload error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Error al subir archivo." },
      { status: 500 },
    );
  }
}
