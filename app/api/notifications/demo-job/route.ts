import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildCalendarReminderBody,
  buildCalendarReminderSms,
} from "@/lib/notifications/calendar";
import { sendSms, isSmsConfigured } from "@/lib/notifications/sms";
import webpush from "web-push";

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const admin = createAdminClient();
  const date = getTomorrowDate();
  const startTime = "09:30";
  const title = "Trabajo programado";
  const project = "Obra general";
  const type = "start" as const;

  const { data: existing } = await admin
    .from("calendar_events")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", date)
    .eq("title", title)
    .eq("start_time", startTime)
    .maybeSingle();

  if (!existing) {
    const { error: insertError } = await admin.from("calendar_events").insert({
      user_id: user.id,
      title,
      date,
      start_time: startTime,
      project,
      type,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  const eventPayload = { title, date, startTime, project, type };
  const body = buildCalendarReminderBody(eventPayload);
  const smsBody = buildCalendarReminderSms(eventPayload);
  const pushPayload = JSON.stringify({
    title: `📅 ${title}`,
    body,
    url: "/dashboard/calendar",
  });

  const results: string[] = [];
  let sent = false;

  const { data: pref } = await admin
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (pref?.sms_enabled && pref.phone_number && isSmsConfigured()) {
    try {
      await sendSms(pref.phone_number, smsBody);
      results.push(`SMS enviado a ${pref.phone_number}`);
      sent = true;
    } catch (err) {
      results.push(err instanceof Error ? err.message : "Error SMS");
    }
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (publicKey && privateKey) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT ?? "mailto:support@navarroconstruction.com",
      publicKey,
      privateKey,
    );

    const { data: subscriptions } = await admin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user.id);

    for (const sub of subscriptions ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          pushPayload,
        );
        sent = true;
      } catch (err) {
        results.push(err instanceof Error ? err.message : "Error push");
      }
    }

    if (subscriptions?.length) {
      results.push(`Push enviado a ${subscriptions.length} dispositivo(s)`);
    }
  }

  if (!sent) {
    return NextResponse.json({
      ok: true,
      message:
        "Evento creado en el calendario para mañana 9:30 AM. Activa push o SMS en Settings para recibir la alerta.",
      event: eventPayload,
      details: results,
    });
  }

  return NextResponse.json({
    ok: true,
    message: "Alerta de prueba enviada. Trabajo mañana a las 9:30 AM.",
    event: eventPayload,
    details: results,
  });
}
