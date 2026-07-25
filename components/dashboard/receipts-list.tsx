"use client";

import { useRef, useState } from "react";
import type { Receipt } from "@/lib/types";
import { ReceiptFormDialog } from "@/components/dashboard/receipt-form-dialog";
import { deleteReceipt, seedReceipts } from "@/app/dashboard/receipts/actions";
import { formatCurrency, formatDate } from "@/lib/format";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
} as const;

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );
}

type ReceiptsListProps = {
  receipts: Receipt[];
  usingMockData?: boolean;
};

export function ReceiptsList({ receipts, usingMockData }: ReceiptsListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | undefined>();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [seeding, setSeeding] = useState(false);

  function openCreate() {
    setMode("create");
    setEditingReceipt(undefined);
    setDialogOpen(true);
  }

  function openEdit(receipt: Receipt) {
    if (!isUuid(receipt.id)) {
      alert(
        "Demo receipts cannot be edited. Click 'Import demo receipts' first, or create a new one.",
      );
      return;
    }
    setMode("edit");
    setEditingReceipt(receipt);
    setDialogOpen(true);
  }

  async function handleDelete(receipt: Receipt) {
    if (!isUuid(receipt.id)) {
      alert("Import demo receipts to Supabase first.");
      return;
    }
    if (!confirm(`Delete receipt from ${receipt.vendor}?`)) return;
    await deleteReceipt(receipt.id);
  }

  async function handleImportDemo() {
    setSeeding(true);
    const result = await seedReceipts();
    alert(result.message);
    setSeeding(false);
  }

  return (
    <>
      {usingMockData && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-900">
            Showing demo receipts. Import them to Supabase to edit from the app.
          </p>
          <button
            onClick={handleImportDemo}
            disabled={seeding}
            className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
          >
            {seeding ? "Importing..." : "Import demo receipts"}
          </button>
        </div>
      )}

      <div
        className="mb-8 cursor-pointer rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center transition hover:border-amber-400 hover:bg-amber-50/50 sm:p-12"
        onClick={openCreate}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          openCreate();
        }}
      >
        <p className="text-4xl">📷</p>
        <p className="mt-3 font-medium text-zinc-900">Click to upload a receipt</p>
        <p className="mt-1 text-sm text-zinc-500">PDF, JPG or PNG up to 10MB</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openCreate();
          }}
          className="mt-4 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          + Upload receipt
        </button>
        <input ref={fileInputRef} type="file" className="hidden" />
      </div>

      <h2 className="mb-4 text-lg font-semibold text-zinc-900">Recent receipts</h2>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-600">
            <tr>
              <th className="px-6 py-3 font-medium">Vendor</th>
              <th className="px-6 py-3 font-medium">Project</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-zinc-50">
                <td className="px-6 py-4 font-medium text-zinc-900">
                  {receipt.vendor}
                  {receipt.fileName && (
                    <p className="text-xs font-normal text-zinc-400">
                      📎 {receipt.fileName.split("/").pop()}
                    </p>
                  )}
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
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(receipt)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(receipt)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReceiptFormDialog
        key={editingReceipt?.id ?? "new"}
        open={dialogOpen}
        mode={mode}
        receipt={editingReceipt}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
