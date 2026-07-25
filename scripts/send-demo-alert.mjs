/**
 * Crea evento mañana 9:30 y envía alerta si hay push/SMS configurado.
 * Uso: node scripts/send-demo-alert.mjs
 */
import { createClient } from "@supabase/supabase-js";
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
const email = "navarroconstructionsllc@gmail.com";

if (!url || !key) {
  console.error("Faltan credenciales Supabase en .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const date = tomorrow.toISOString().split("T")[0];

const { data: users } = await supabase.auth.admin.listUsers();
const user = users?.users?.find((u) => u.email === email);

if (!user) {
  console.error("Usuario no encontrado:", email);
  process.exit(1);
}

const event = {
  user_id: user.id,
  title: "Trabajo programado",
  date,
  start_time: "09:30:00",
  project: "Obra general",
  type: "start",
};

const { data: existing } = await supabase
  .from("calendar_events")
  .select("id")
  .eq("user_id", user.id)
  .eq("date", date)
  .eq("title", event.title)
  .maybeSingle();

if (existing) {
  console.log("Evento ya existe:", existing.id);
} else {
  const { error } = await supabase.from("calendar_events").insert(event);
  if (error) {
    console.error("Error creando evento:", error.message);
    process.exit(1);
  }
  console.log("Evento creado para mañana 9:30 AM");
}

const { data: subs } = await supabase
  .from("push_subscriptions")
  .select("id")
  .eq("user_id", user.id);

console.log("Suscripciones push:", subs?.length ?? 0);
console.log("Fecha:", date, "Hora: 9:30 AM");
console.log("");
console.log("Para recibir la alerta ahora, abre Settings en la app y pulsa Enviar prueba,");
console.log("o visita (logueado): POST /api/notifications/demo-job");
