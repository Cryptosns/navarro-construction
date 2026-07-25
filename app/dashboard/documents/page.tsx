import { PageHeader } from "@/components/dashboard/page-header";
import { documents } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

const docIcons = {
  plano: "📐",
  contrato: "📄",
  permiso: "✅",
  reporte: "📊",
} as const;

export default function DocumentsPage() {
  return (
    <>
      <PageHeader
        title="Documents"
        description="Plans, contracts, permits and reports in one place."
        action={
          <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600">
            + Subir documento
          </button>
        }
      />
      <main className="flex-1 overflow-auto p-8">
        <div className="grid gap-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-amber-200"
            >
              <span className="text-2xl">{docIcons[doc.type]}</span>
              <div className="flex-1">
                <p className="font-medium text-zinc-900">{doc.name}</p>
                <p className="text-sm text-zinc-500">{doc.project}</p>
              </div>
              <div className="text-right text-sm text-zinc-500">
                <p>{doc.size}</p>
                <p>{formatDate(doc.updatedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
