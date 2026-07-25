import { PageHeader } from "@/components/dashboard/page-header";
import { CalendarList } from "@/components/dashboard/calendar-list";
import type { CalendarEvent } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .order("date", { ascending: true });

  const usingMockData = Boolean(error || !data?.length);

  const events = usingMockData
    ? (await import("@/lib/mock-data")).calendarEvents
    : (data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        date: row.date,
        project: row.project,
        type: row.type as CalendarEvent["type"],
      }));

  return (
    <>
      <PageHeader
        title="Calendar"
        description="Milestones, inspections and project meetings."
      />
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <CalendarList events={events} usingMockData={usingMockData} />
      </main>
    </>
  );
}
