"use client";

import { useRef, useState } from "react";
import type { Receipt } from "@/lib/types";
import { saveReceipt } from "@/app/dashboard/receipts/actions";
import { Button } from "@/components/ui/button";

const categories = ["Materials", "Equipment", "Labor", "Subcontractor", "Other"];

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

type ReceiptFormData = {
  vendor: string;
  project: string;
  amount: number;
  category: string;
  date: string;
  status: "pending" | "approved" | "rejected";
};

const emptyForm: ReceiptFormData = {
  vendor: "",
  project: "",
  amount: 0,
  category: "Materials",
  date: new Date().toISOString().split("T")[0],
  status: "pending",
};

type ReceiptFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  receipt?: Receipt;
  onClose: () => void;
};

export function ReceiptFormDialog({
  open,
  mode,
  receipt,
  onClose,
}: ReceiptFormDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ReceiptFormData>(() =>
    receipt
      ? {
          vendor: receipt.vendor,
          project: receipt.project,
          amount: receipt.amount,
          category: receipt.category,
          date: receipt.date,
          status: receipt.status,
        }
      : emptyForm,
  );
  const [fileLabel, setFileLabel] = useState(receipt?.fileName ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!open) return null;

  function updateField<K extends keyof ReceiptFormData>(
    key: K,
    value: ReceiptFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    if (mode === "edit" && receipt) formData.set("id", receipt.id);
    formData.set("vendor", form.vendor);
    formData.set("project", form.project);
    formData.set("amount", String(form.amount));
    formData.set("category", form.category);
    formData.set("date", form.date);
    formData.set("status", form.status);
    const file = fileRef.current?.files?.[0];
    if (file) formData.set("file", file);

    const result = await saveReceipt(formData);

    setLoading(false);
    setMessage(result.message);
    if (result.ok) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            {mode === "create" ? "Upload receipt" : "Edit receipt"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">File (PDF, JPG, PNG)</span>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                setFileLabel(e.target.files?.[0]?.name ?? "")
              }
              className="w-full text-sm text-zinc-600"
            />
            {fileLabel && (
              <p className="mt-1 text-xs text-zinc-500">Selected: {fileLabel}</p>
            )}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Vendor *</span>
            <input
              required
              value={form.vendor}
              onChange={(e) => updateField("vendor", e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Project</span>
            <input
              value={form.project}
              onChange={(e) => updateField("project", e.target.value)}
              className={inputClass}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Amount (USD)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.amount}
                onChange={(e) => updateField("amount", Number(e.target.value))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Category</span>
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className={inputClass}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Status</span>
              <select
                value={form.status}
                onChange={(e) =>
                  updateField(
                    "status",
                    e.target.value as ReceiptFormData["status"],
                  )
                }
                className={inputClass}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {message && (
            <p className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
              {message}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {loading ? "Saving..." : mode === "create" ? "Save receipt" : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20";
