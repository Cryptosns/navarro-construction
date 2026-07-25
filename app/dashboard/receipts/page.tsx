import { PageHeader } from "@/components/dashboard/page-header";
import { receipts } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/format";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
} as const;

export default function ReceiptsPage() {
  return (
    <>
      <PageHeader
        title="Upload Receipts"
        description="Upload and track expense receipts by project."
        action={
          <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600">
            + Upload receipt
          </button>
        }
      />
      <main className="flex-1 overflow-auto p-8">
        <div className="mb-8 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <p className="text-4xl">📷</p>
          <p className="mt-3 font-medium text-zinc-900">
            Drag & drop receipts here
          </p>
          <p className="mt-1 text-sm text-zinc-500">PDF, JPG or PNG up to 10MB</p>
          <button className="mt-4 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
            Browse files
          </button>
        </div>

        <h2 className="mb-4 text-lg font-semibold text-zinc-900">
          Recent receipts
        </h2>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-600">
              <tr>
                <th className="px-6 py-3 font-medium">Vendor</th>
                <th className="px-6 py-3 font-medium">Project</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {receipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {receipt.vendor}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{receipt.project}</td>
                  <td className="px-6 py-4 text-zinc-600">{receipt.category}</td>
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {formatCurrency(receipt.amount)}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {formatDate(receipt.date)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[receipt.status]}`}
                    >
                      {receipt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
