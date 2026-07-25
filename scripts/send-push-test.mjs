/**
 * Diagnóstico + envío de alerta push de prueba.
 * node scripts/send-push-test.mjs
 */
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, "");
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const email = "navarroconstructionsllc@gmail.com";

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: users } = await supabase.auth.admin.listUsers();
const user = users?.users?.find((u) => u.email === email);
console.log("Usuario:", user?.email ?? "NO ENCONTRADO");

const { data: prefs } = await supabase
  .from("notification_preferences")
  .select("*")
  .eq("user_id", user.id)
  .maybeSingle();
console.log("Prefs:", prefs);

const { data: subs } = await supabase
  .from("push_subscriptions")
  .select("*")
  .eq("user_id", user.id);
console.log("Suscripciones push:", subs?.length ?? 0);
if (subs?.length) {
  for (const s of subs) {
    const kind = s.endpoint.includes("apple.com")
      ? "iPhone/iPad (Apple)"
      : s.endpoint.includes("google.com") || s.endpoint.includes("fcm")
        ? "Android/Chrome"
        : "Otro";
    console.log("  -", kind, "| creada:", s.created_at);
  }
}

const { data: events } = await supabase
  .from("calendar_events")
  .select("title, date, start_time, project, type")
  .eq("user_id", user.id)
  .gte("date", new Date().toISOString().split("T")[0])
  .order("date");
console.log("Eventos próximos:", events);

if (!publicKey || !privateKey) {
  console.log("\n❌ Faltan VAPID keys en .env.local — push no se puede enviar desde aquí.");
  console.log("   Agrégalas desde Vercel o genera con: npx web-push generate-vapid-keys");
  process.exit(1);
}

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? "mailto:navarroconstructionsllc@gmail.com",
  publicKey,
  privateKey,
);

const body = [
  "Hora: 9:30 AM",
  "Tipo: Iniciar",
  "Proyecto: Obra general",
  "Fecha: 2026-07-26",
].join("\n");

const payload = JSON.stringify({
  title: "📅 Trabajo programado",
  body,
  url: "/dashboard/calendar",
});

if (!subs?.length) {
  console.log("\n❌ No hay suscripción push. Activa push en Settings desde el ícono en pantalla de inicio (iPhone).");
  process.exit(1);
}

for (const sub of subs) {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload,
    );
    console.log("\n✅ Push enviado a:", sub.endpoint.slice(0, 60) + "...");
  } catch (err) {
    console.log("\n❌ Error push:", err.message);
    if (String(err.message).includes("410") || String(err.message).includes("404")) {
      await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      console.log("   Suscripción eliminada (expirada). Vuelve a activar push en Settings.");
    }
  }
}
