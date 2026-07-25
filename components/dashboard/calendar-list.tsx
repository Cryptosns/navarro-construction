"use client";

import { useState } from "react";
import type { CalendarEvent } from "@/lib/types";
import { CalendarFormDialog } from "@/components/dashboard/calendar-form-dialog";
import {
  deleteCalendarEvent,
  seedCalendarEvents,
} from "@/app/dashboard/calendar/actions";
import { formatDate } from "@/lib/format";

const eventColors = {
  inspection: "bg-blue-100 text-blue-800",
  delivery: "bg-emerald-100 text-emerald-800",
  meeting: "bg-violet-100 text-violet-800",
  deadline: "bg-red-100 text-red-800",
} as const;

const eventLabels = {
  inspection: "Inspección",
  delivery: "Entrega",
  meeting: "Reunión",
  deadline: "Hito",
} as const;

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );
}

type CalendarListProps = {
  events: CalendarEvent[];
  usingMockData?: boolean;
};

export function CalendarList({ events, usingMockData }: CalendarListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [seeding, setSeeding] = useState(false);

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  function openCreate() {
    setMode("create");
    setEditingEvent(undefined);
    setDialogOpen(true);
  }

  function openEdit(event: CalendarEvent) {
    if (!isUuid(event.id)) {
      alert(
        "Estos son eventos de demo. Importa los datos de demo o crea un evento nuevo.",
      );
      return;
    }
    setMode("edit");
    setEditingEvent(event);
    setDialogOpen(true);
  }

  async function handleDelete(event: CalendarEvent) {
    if (!isUuid(event.id)) {
      alert("Importa los eventos de demo a Supabase primero.");
      return;
    }
    if (!confirm(`¿Eliminar "${event.title}"?`)) return;
    await deleteCalendarEvent(event.id);
  }

  async function handleImportDemo() {
    setSeeding(true);
    const result = await seedCalendarEvents();
    alert(result.message);
    setSeeding(false);
  }

  return (
    <>
      {usingMockData && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-900">
            Mostrando eventos de demo. Importa a Supabase para editarlos, o crea
            uno nuevo.
          </p>
          <button
            onClick={handleImportDemo}
            disabled={seeding}
            className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
          >
            {seeding ? "Importando..." : "Importar eventos demo"}
          </button>
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button
          onClick={openCreate}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
        >
          + Nuevo evento
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <p className="text-4xl">📅</p>
          <p className="mt-3 font-medium text-zinc-900">No hay eventos</p>
          <p className="mt-1 text-sm text-zinc-500">
            Crea tu primer evento con el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((event) => {
            const formatted = formatDate(event.date);
            const day = formatted.split(" ")[0];
            const month = formatted.split(" ")[1];

            return (
              <div
                key={event.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:p-5"
              >
                <div className="flex min-w-24 items-center gap-3 sm:block sm:text-center">
                  <div>
                    <p className="text-xs font-medium uppercase text-zinc-500">
                      {month}
                    </p>
                    <p className="text-2xl font-bold text-zinc-900">{day}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium sm:hidden ${eventColors[event.type]}`}
                  >
                    {eventLabels[event.type]}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-900">{event.title}</p>
                  {event.project && (
                    <p className="mt-0.5 text-sm text-zinc-500">{event.project}</p>
                  )}
                </div>

                <span
                  className={`hidden rounded-full px-3 py-1 text-xs font-medium sm:inline ${eventColors[event.type]}`}
                >
                  {eventLabels[event.type]}
                </span>

                <div className="flex gap-2 sm:shrink-0">
                  <button
                    onClick={() => openEdit(event)}
                    className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 sm:flex-none"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(event)}
                    className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CalendarFormDialog
        key={editingEvent?.id ?? "new"}
        open={dialogOpen}
        mode={mode}
        event={editingEvent}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
