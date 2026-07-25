import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { projects, aiInsights } from "@/lib/mock-data";

const systemPrompt = `You are Dave, the NavarroConstruction AI project assistant.
Respond in clear, practical English (or Spanish if the user writes in Spanish).
You have access to this project data:
${JSON.stringify(projects, null, 2)}

Insights:
${JSON.stringify(aiInsights, null, 2)}

Help with budgets, schedules, risks, staffing and construction decisions.
Be concise but useful.`;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OpenAI API key no configurada" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { messages } = body;

    if (!messages?.length) {
      return Response.json({ error: "Mensajes requeridos" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 800,
    });

    const reply = completion.choices[0]?.message?.content ?? "Sin respuesta.";

    return Response.json({ reply });
  } catch (err) {
    console.error("OpenAI API error:", err);

    if (err instanceof OpenAI.APIError) {
      if (err.status === 429) {
        return Response.json(
          {
            error:
              "Cuota de OpenAI agotada. Revisa tu plan y facturación en platform.openai.com",
          },
          { status: 429 },
        );
      }

      if (err.status === 401) {
        return Response.json(
          { error: "API key de OpenAI inválida. Revisa tu .env.local" },
          { status: 401 },
        );
      }

      return Response.json(
        { error: err.message ?? "Error al conectar con OpenAI" },
        { status: err.status ?? 500 },
      );
    }

    return Response.json(
      { error: "Error interno del servidor. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
