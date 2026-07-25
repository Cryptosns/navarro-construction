import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildCalendarReminderBody,
  buildCalendarReminderSms,
  getEventDateTime,
} from "@/lib/notifications/calendar";
import { sendSms, isSmsConfigured } from "@/lib/notifications/sms";
import type { CalendarEvent } from "@/lib/types";

type ReminderResult = {
  checked: number;
  sent: number;
  errors: string[];
};

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:support@navarroconstruction.com";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys are not configured.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

function isWebPushConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
  );
}

type EventRow = {
  id: string;
  title: string;
  date: string;
  start_time?: string | null;
  project?: string | null;
  type: string;
};

type PrefRow = {
  user_id: string;
  push_enabled: boolean;
  sms_enabled: boolean;
  phone_number?: string | null;
  reminder_minutes: number;
};

async function deliverReminder(
  pref: PrefRow,
  event: EventRow,
  subscriptions: { id: string; endpoint: string; p256dh: string; auth: string }[],
): Promise<{ delivered: boolean; errors: string[] }> {
  const errors: string[] = [];
  let delivered = false;

  const eventPayload = {
    title: event.title,
    date: event.date,
    startTime: event.start_time,
    project: event.project,
    type: event.type as CalendarEvent["type"],
  };

  if (pref.sms_enabled && pref.phone_number && isSmsConfigured()) {
    try {
      await sendSms(pref.phone_number, buildCalendarReminderSms(eventPayload));
      delivered = true;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "SMS failed");
    }
  }

  if (pref.push_enabled && subscriptions.length && isWebPushConfigured()) {
    try {
      configureWebPush();
      const body = buildCalendarReminderBody(eventPayload);
      const payload = JSON.stringify({
        title: `📅 ${event.title}`,
        body,
        url: "/dashboard/calendar",
      });

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
          );
          delivered = true;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Push failed";
          errors.push(message);
        }
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "Push failed");
    }
  }

  return { delivered, errors };
}

export async function processCalendarReminders(): Promise<ReminderResult> {
  const supabase = createAdminClient();
  const result: ReminderResult = { checked: 0, sent: 0, errors: [] };

  const { data: preferences, error: prefError } = await supabase
    .from("notification_preferences")
    .select("*")
    .or("push_enabled.eq.true,sms_enabled.eq.true");

  if (prefError) {
    result.errors.push(prefError.message);
    return result;
  }

  const now = new Date();

  for (const pref of (preferences ?? []) as PrefRow[]) {
    const { data: subscriptions } = pref.push_enabled
      ? await supabase.from("push_subscriptions").select("*").eq("user_id", pref.user_id)
      : { data: [] };

    if (pref.sms_enabled && !pref.phone_number) continue;
    if (pref.push_enabled && !subscriptions?.length && !pref.sms_enabled) continue;
    if (!pref.push_enabled && !pref.sms_enabled) continue;

    const { data: events } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", pref.user_id)
      .gte("date", now.toISOString().split("T")[0]);

    for (const event of events ?? []) {
      result.checked += 1;

      const eventTime = getEventDateTime(event.date, event.start_time);
      const reminderAt = new Date(eventTime.getTime() - pref.reminder_minutes * 60 * 1000);
      const windowEnd = new Date(reminderAt.getTime() + 20 * 60 * 1000);

      if (now < reminderAt || now > windowEnd) continue;

      const { data: existing } = await supabase
        .from("calendar_reminder_logs")
        .select("id")
        .eq("event_id", event.id)
        .eq("reminder_minutes", pref.reminder_minutes)
        .maybeSingle();

      if (existing) continue;

      const { delivered, errors } = await deliverReminder(
        pref,
        event,
        subscriptions ?? [],
      );

      result.errors.push(...errors);

      if (delivered) {
        await supabase.from("calendar_reminder_logs").insert({
          user_id: pref.user_id,
          event_id: event.id,
          reminder_minutes: pref.reminder_minutes,
        });
        result.sent += 1;
      }
    }
  }

  return result;
}

export async function sendTestReminder(userId: string): Promise<{ ok: boolean; message: string }> {
  const supabase = createAdminClient();
  const { data: pref } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (pref?.sms_enabled && pref.phone_number) {
    if (!isSmsConfigured()) {
      return { ok: false, message: "Faltan las credenciales de Twilio en el servidor." };
    }

    try {
      await sendSms(
        pref.phone_number,
        "NavarroConstruction: Recordatorios SMS activos. Recibirás alertas de tu calendario con todos los datos del evento.",
      );
      return { ok: true, message: `SMS de prueba enviado a ${pref.phone_number}.` };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "No se pudo enviar el SMS.",
      };
    }
  }

  return sendTestPush(userId);
}

export async function sendTestPush(userId: string): Promise<{ ok: boolean; message: string }> {
  if (!isWebPushConfigured()) {
    return { ok: false, message: "Activa SMS o configura notificaciones push." };
  }

  try {
    configureWebPush();
  } catch {
    return { ok: false, message: "Faltan las claves VAPID en el servidor." };
  }

  const supabase = createAdminClient();
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (!subscriptions?.length) {
    return { ok: false, message: "Guarda tu número y activa SMS, o activa notificaciones push." };
  }

  const payload = JSON.stringify({
    title: "📅 NavarroConstruction",
    body: "Las notificaciones del calendario están activas.\nRecibirás recordatorios de tus eventos.",
    url: "/dashboard/calendar",
  });

  for (const sub of subscriptions) {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload,
    );
  }

  return { ok: true, message: "Notificación push de prueba enviada." };
}
