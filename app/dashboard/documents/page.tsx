import { PageHeader } from "@/components/dashboard/page-header";
import { DocumentsList } from "@/components/dashboard/documents-list";
import { createClient } from "@/lib/supabase/server";
import { formatFileSize } from "@/lib/format";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("updated_at", { ascending: false });

  const usingMockData = Boolean(error || !data?.length);

  const documents = usingMockData
    ? (await import("@/lib/mock-data")).documents
    : (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        project: row.project,
        type: row.type,
        updatedAt: row.updated_at?.split("T")[0] ?? row.created_at?.split("T")[0] ?? "",
        size: formatFileSize(row.size_bytes),
        notes: row.notes ?? undefined,
        storagePath: row.storage_path ?? undefined,
        mimeType: row.mime_type ?? undefined,
      }));

  return (
    <>
      <PageHeader
        title="Documents"
        description="Planes, contratos, permisos y reportes en un solo lugar."
      />
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <DocumentsList documents={documents} usingMockData={usingMockData} />
      </main>
    </>
  );
}
