import type { CalendarEvent } from "@/lib/types";

export const calendarEventLabels: Record<CalendarEvent["type"], string> = {
  inspection: "Inspección",
  delivery: "Entrega",
  meeting: "Reunión",
  start: "Iniciar",
};

export function buildCalendarReminderBody(event: {
  title: string;
  date: string;
  startTime?: string | null;
  project?: string | null;
  type: CalendarEvent["type"];
}): string {
  const parts: string[] = [];

  if (event.startTime) {
    const [h, m] = event.startTime.split(":");
    const d = new Date();
    d.setHours(Number(h), Number(m), 0, 0);
    parts.push(
      `Hora: ${d.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", hour12: true })}`,
    );
  }

  parts.push(`Tipo: ${calendarEventLabels[event.type]}`);

  if (event.project) {
    parts.push(`Proyecto: ${event.project}`);
  }

  parts.push(`Fecha: ${event.date}`);

  return parts.join("\n");
}

export function buildCalendarReminderSms(event: {
  title: string;
  date: string;
  startTime?: string | null;
  project?: string | null;
  type: CalendarEvent["type"];
}): string {
  const details = buildCalendarReminderBody(event);
  return `NavarroConstruction\nRecordatorio: ${event.title}\n${details}`;
}

export function getEventDateTime(date: string, startTime?: string | null): Date {
  const time = startTime?.slice(0, 5) ?? "07:00";
  // Horario de Ciudad de México (UTC-6, sin horario de verano desde 2022)
  return new Date(`${date}T${time}:00-06:00`);
}
