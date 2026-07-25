import { PageHeader } from "@/components/dashboard/page-header";
import { estimates } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/format";

const statusStyles = {
  draft: "bg-zinc-100 text-zinc-600",
  sent: "bg-blue-100 text-blue-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
} as const;

const statusLabels = {
  draft: "Draft",
  sent: "Sent",
  approved: "Approved",
  rejected: "Rejected",
} as const;

export default function EstimatesPage() {
  return (
    <>
      <PageHeader
        title="Estimates"
        description="Create and manage project cost estimates for clients."
        action={
          <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600">
            + New estimate
          </button>
        }
      />
      <main className="flex-1 overflow-auto p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {estimates.map((estimate) => (
            <div
              key={estimate.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-zinc-900">{estimate.title}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[estimate.status]}`}
                >
                  {statusLabels[estimate.status]}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">{estimate.project}</p>
              <p className="text-sm text-zinc-500">{estimate.client}</p>
              <p className="mt-4 text-2xl font-bold text-zinc-900">
                {formatCurrency(estimate.amount)}
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                Created {formatDate(estimate.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
