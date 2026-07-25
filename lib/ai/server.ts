import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

let openaiClient: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null };
  return { supabase, user };
}

export async function buildAssistantContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<string> {
  const today = new Date().toISOString().split("T")[0];

  const [projectsRes, eventsRes] = await Promise.all([
    supabase
      .from("projects")
      .select("name, status, progress, budget, spent, deadline")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("calendar_events")
      .select("title, date, start_time, type")
      .eq("user_id", userId)
      .gte("date", today)
      .order("date")
      .limit(6),
  ]);

  const parts: string[] = [];

  if (projectsRes.data?.length) {
    parts.push(
      "Proyectos:",
      ...projectsRes.data.map(
        (p) =>
          `- ${p.name} (${p.status}, ${p.progress}%): presupuesto $${Number(p.budget).toLocaleString()}, gastado $${Number(p.spent).toLocaleString()}, deadline ${p.deadline ?? "N/A"}`,
      ),
    );
  }

  if (eventsRes.data?.length) {
    parts.push(
      "Próximos eventos:",
      ...eventsRes.data.map(
        (e) => `- ${e.date} ${e.start_time?.slice(0, 5) ?? ""} ${e.title} (${e.type})`,
      ),
    );
  }

  return parts.length ? parts.join("\n") : "Sin datos de proyectos aún en la base de datos.";
}

export function trimChatHistory(
  messages: { role: string; content: string }[],
  maxTurns = 8,
): ChatCompletionMessageParam[] {
  const filtered = messages.filter(
    (m) => m.content && m.role !== "system" && (m.role === "user" || m.role === "assistant"),
  );
  return filtered.slice(-maxTurns * 2).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
}

export function languageInstruction(language: string): string {
  if (language === "es") {
    return "Responde SIEMPRE en español. Sé breve y directo (máximo 3-4 oraciones salvo que pidan detalle).";
  }
  if (language === "en") {
    return "Always respond in English. Be brief and direct (max 3-4 sentences unless more detail is requested).";
  }
  return "Responde en el mismo idioma del usuario (español o inglés). Sé breve y directo.";
}
