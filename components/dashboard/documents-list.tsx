"use client";

import { useState } from "react";
import type { Document } from "@/lib/types";
import { DocumentFormDialog } from "@/components/dashboard/document-form-dialog";
import {
  deleteDocument,
  getDocumentDownloadUrl,
  seedDocuments,
} from "@/app/dashboard/documents/actions";
import { formatDate } from "@/lib/format";

const docIcons = {
  plano: "📐",
  contrato: "📄",
  permiso: "✅",
  reporte: "📊",
} as const;

const typeLabels = {
  plano: "Plano",
  contrato: "Contrato",
  permiso: "Permiso",
  reporte: "Reporte",
} as const;

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );
}

type DocumentsListProps = {
  documents: Document[];
  usingMockData?: boolean;
};

export function DocumentsList({ documents, usingMockData }: DocumentsListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | undefined>();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [seeding, setSeeding] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  function openCreate() {
    setMode("create");
    setEditingDocument(undefined);
    setDialogOpen(true);
  }

  function openEdit(doc: Document) {
    if (!isUuid(doc.id)) {
      alert(
        "Los documentos demo no se pueden editar. Importa los demo primero o crea uno nuevo.",
      );
      return;
    }
    setMode("edit");
    setEditingDocument(doc);
    setDialogOpen(true);
  }

  async function handleDelete(doc: Document) {
    if (!isUuid(doc.id)) {
      alert("Importa los documentos demo a Supabase primero.");
      return;
    }
    if (!confirm(`¿Eliminar "${doc.name}"?`)) return;
    await deleteDocument(doc.id);
  }

  async function handleDownload(doc: Document) {
    if (!isUuid(doc.id)) {
      alert("Importa los documentos demo para descargar archivos reales.");
      return;
    }
    if (!doc.storagePath) {
      alert("Este documento no tiene archivo adjunto.");
      return;
    }

    setDownloadingId(doc.id);
    const result = await getDocumentDownloadUrl(doc.id);
    setDownloadingId(null);

    if (!result.ok || !result.url) {
      alert(result.message ?? "No se pudo descargar.");
      return;
    }

    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  async function handleImportDemo() {
    setSeeding(true);
    const result = await seedDocuments();
    alert(result.message);
    setSeeding(false);
  }

  return (
    <>
      {usingMockData && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-900">
            Mostrando documentos demo. Impórtalos a Supabase para editarlos desde la app.
          </p>
          <button
            onClick={handleImportDemo}
            disabled={seeding}
            className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
          >
            {seeding ? "Importando..." : "Importar documentos demo"}
          </button>
        </div>
      )}

      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
        >
          + Subir documento
        </button>
      </div>

      <div className="grid gap-3">
        {documents.length === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center">
            <p className="text-4xl">📁</p>
            <p className="mt-3 font-medium text-zinc-900">Sin documentos aún</p>
            <p className="mt-1 text-sm text-zinc-500">
              Sube planos, contratos, permisos y reportes por proyecto.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Subir primer documento
            </button>
          </div>
        )}

        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-amber-200 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <span className="text-2xl">{docIcons[doc.type]}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900">{doc.name}</p>
                <p className="text-sm text-zinc-500">{doc.project || "Sin proyecto"}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
                    {typeLabels[doc.type]}
                  </span>
                  <span>{doc.size}</span>
                  <span>{formatDate(doc.updatedAt)}</span>
                </div>
                {doc.notes && (
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{doc.notes}</p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
              {doc.storagePath && (
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  disabled={downloadingId === doc.id}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  {downloadingId === doc.id ? "Abriendo..." : "Descargar"}
                </button>
              )}
              <button
                type="button"
                onClick={() => openEdit(doc)}
                className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(doc)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <DocumentFormDialog
        key={editingDocument?.id ?? "new"}
        open={dialogOpen}
        mode={mode}
        document={editingDocument}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
