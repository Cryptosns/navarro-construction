"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CalendarEvent } from "@/lib/types";

export type CalendarFormData = {
  title: string;
  date: string;
  project: string;
  type: CalendarEvent["type"];
};

function revalidateCalendarPages() {
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
}

export async function createCalendarEvent(
  data: CalendarFormData,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "You must be logged in." };
  if (!data.title.trim()) return { ok: false, message: "Title is required." };

  const { error } = await supabase.from("calendar_events").insert({
    user_id: user.id,
    title: data.title.trim(),
    date: data.date || new Date().toISOString().split("T")[0],
    project: data.project.trim(),
    type: data.type,
  });

  if (error) {
    return {
      ok: false,
      message: error.message.includes("relation")
        ? "Run the calendar SQL in supabase/schema.sql first."
        : error.message,
    };
  }

  revalidateCalendarPages();
  return { ok: true, message: "Event created." };
}

export async function updateCalendarEvent(
  id: string,
  data: CalendarFormData,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "You must be logged in." };
  if (!data.title.trim()) return { ok: false, message: "Title is required." };

  const { error } = await supabase
    .from("calendar_events")
    .update({
      title: data.title.trim(),
      date: data.date,
      project: data.project.trim(),
      type: data.type,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidateCalendarPages();
  return { ok: true, message: "Event updated." };
}

export async function deleteCalendarEvent(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "You must be logged in." };

  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidateCalendarPages();
  return { ok: true, message: "Event deleted." };
}

export async function seedCalendarEvents(): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "You must be logged in." };

  const { count } = await supabase
    .from("calendar_events")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) {
    return { ok: false, message: "You already have calendar events in the database." };
  }

  const { calendarEvents } = await import("@/lib/mock-data");
  const rows = calendarEvents.map((e) => ({
    user_id: user.id,
    title: e.title,
    date: e.date,
    project: e.project,
    type: e.type,
  }));

  const { error } = await supabase.from("calendar_events").insert(rows);
  if (error) return { ok: false, message: error.message };

  revalidateCalendarPages();
  return { ok: true, message: "Demo calendar events imported." };
}
