"use client";

import { useState } from "react";
import type { CalendarEvent } from "@/lib/types";
import {
  createCalendarEvent,
  updateCalendarEvent,
  type CalendarFormData,
} from "@/app/dashboard/calendar/actions";
import { Button } from "@/components/ui/button";

const typeOptions: { value: CalendarEvent["type"]; label: string }[] = [
  { value: "inspection", label: "Inspección" },
  { value: "delivery", label: "Entrega" },
  { value: "meeting", label: "Reunión" },
  { value: "start", label: "Iniciar" },
];

const emptyForm: CalendarFormData = {
  title: "",
  date: new Date().toISOString().split("T")[0],
  project: "",
  type: "meeting",
};

type CalendarFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  event?: CalendarEvent;
  onClose: () => void;
};

export function CalendarFormDialog({
  open,
  mode,
  event,
  onClose,
}: CalendarFormDialogProps) {
  const [form, setForm] = useState<CalendarFormData>(() =>
    event
      ? {
          title: event.title,
          date: event.date,
          project: event.project,
          type: event.type,
        }
      : emptyForm,
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!open) return null;

  function updateField<K extends keyof CalendarFormData>(
    key: K,
    value: CalendarFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result =
      mode === "create"
        ? await createCalendarEvent(form)
        : await updateCalendarEvent(event!.id, form);

    setLoading(false);
    setMessage(result.message);

    if (result.ok) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            {mode === "create" ? "Nuevo evento" : "Editar evento"}
          </h2>
          <p className="text-sm text-zinc-500">
            Programa hitos, inspecciones y reuniones.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          <Field label="Título *">
            <input
              required
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={inputClass}
              placeholder="Ej. Inspección de estructura"
            />
          </Field>

          <Field label="Fecha *">
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => updateField("date", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Proyecto">
            <input
              value={form.project}
              onChange={(e) => updateField("project", e.target.value)}
              className={inputClass}
              placeholder="Nombre del proyecto"
            />
          </Field>

          <Field label="Tipo">
            <select
              value={form.type}
              onChange={(e) =>
                updateField("type", e.target.value as CalendarEvent["type"])
              }
              className={inputClass}
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>

          {message && (
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                message.includes("created") ||
                message.includes("updated") ||
                message.includes("Event")
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {loading
                ? "Guardando..."
                : mode === "create"
                  ? "Crear evento"
                  : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-700">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20";
