import { PageHeader } from "@/components/dashboard/page-header";
import { calendarEvents } from "@/lib/mock-data";
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

export default function CalendarPage() {
  const sorted = [...calendarEvents].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return (
    <>
      <PageHeader
        title="Calendar"
        description="Milestones, inspections and project meetings."
        action={
          <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600">
            + Nuevo evento
          </button>
        }
      />
      <main className="flex-1 overflow-auto p-8">
        <div className="space-y-3">
          {sorted.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="min-w-24 text-center">
                <p className="text-xs font-medium uppercase text-zinc-500">
                  {formatDate(event.date).split(" ")[1]}
                </p>
                <p className="text-2xl font-bold text-zinc-900">
                  {formatDate(event.date).split(" ")[0]}
                </p>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-zinc-900">{event.title}</p>
                <p className="mt-0.5 text-sm text-zinc-500">{event.project}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${eventColors[event.type]}`}
              >
                {eventLabels[event.type]}
              </span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
