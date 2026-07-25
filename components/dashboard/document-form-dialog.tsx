"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Document, DocumentType } from "@/lib/types";
import { saveDocument } from "@/app/dashboard/documents/actions";
import {
  MAX_DOCUMENT_BYTES,
  uploadDocumentFile,
} from "@/lib/documents/upload-client";
import { Button } from "@/components/ui/button";

const typeOptions: { value: DocumentType; label: string }[] = [
  { value: "plano", label: "Plano" },
  { value: "contrato", label: "Contrato" },
  { value: "permiso", label: "Permiso" },
  { value: "reporte", label: "Reporte" },
];

type DocumentFormData = {
  name: string;
  project: string;
  type: DocumentType;
  notes: string;
};

const emptyForm: DocumentFormData = {
  name: "",
  project: "",
  type: "reporte",
  notes: "",
};

type DocumentFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  document?: Document;
  onClose: () => void;
};

export function DocumentFormDialog({
  open,
  mode,
  document,
  onClose,
}: DocumentFormDialogProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<DocumentFormData>(() =>
    document
      ? {
          name: document.name,
          project: document.project,
          type: document.type,
          notes: document.notes ?? "",
        }
      : emptyForm,
  );
  const [fileLabel, setFileLabel] = useState(
    document?.storagePath?.split("/").pop() ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!open) return null;

  function updateField<K extends keyof DocumentFormData>(
    key: K,
    value: DocumentFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setStatus(null);

    try {
      const file = fileRef.current?.files?.[0];
      let storagePath: string | undefined;
      let sizeBytes: number | undefined;
      let mimeType: string | undefined;

      if (file?.size) {
        setStatus("Subiendo archivo...");
        const uploaded = await uploadDocumentFile(file);
        storagePath = uploaded.storagePath;
        sizeBytes = uploaded.sizeBytes;
        mimeType = uploaded.mimeType;
      }

      setStatus("Guardando...");
      const result = await saveDocument({
        id: mode === "edit" && document ? document.id : null,
        name: form.name,
        project: form.project,
        type: form.type,
        notes: form.notes,
        storagePath,
        sizeBytes,
        mimeType,
      });

      setMessage(result.message);
      if (result.ok) {
        router.refresh();
        onClose();
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setLoading(false);
      setStatus(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            {mode === "create" ? "Subir documento" : "Editar documento"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Archivo {mode === "create" ? "" : "(opcional — reemplaza el actual)"}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
              onChange={(e) => setFileLabel(e.target.files?.[0]?.name ?? "")}
              className="w-full text-sm text-zinc-600"
            />
            {fileLabel && (
              <p className="mt-1 text-xs text-zinc-500">Seleccionado: {fileLabel}</p>
            )}
            <p className="mt-1 text-xs text-zinc-400">
              Máximo {(MAX_DOCUMENT_BYTES / (1024 * 1024)).toFixed(0)} MB
            </p>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Nombre *</span>
            <input
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={inputClass}
              placeholder="Ej. Contrato principal v2"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Proyecto</span>
            <input
              value={form.project}
              onChange={(e) => updateField("project", e.target.value)}
              className={inputClass}
              placeholder="Nombre del proyecto"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Tipo</span>
            <select
              value={form.type}
              onChange={(e) => updateField("type", e.target.value as DocumentType)}
              className={inputClass}
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Notas</span>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Descripción, versión, observaciones..."
            />
          </label>

          {status && (
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
              {status}
            </p>
          )}

          {message && (
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                message.includes("guardado") || message.includes("actualizado")
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {message}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {loading
                ? status ?? "Guardando..."
                : mode === "create"
                  ? "Guardar documento"
                  : "Actualizar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20";
