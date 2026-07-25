import { PageHeader } from "@/components/dashboard/page-header";
import { reports } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Progress, budget and risk reports."
        action={
          <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600">
            + Generar reporte
          </button>
        }
      />
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-zinc-900">{report.title}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    report.status === "published"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {report.status === "published" ? "Publicado" : "Borrador"}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">{report.project}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                <span>{report.period}</span>
                <span>{formatDate(report.createdAt)}</span>
              </div>
              <button className="mt-4 w-full rounded-lg border border-zinc-200 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
                Ver reporte
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
