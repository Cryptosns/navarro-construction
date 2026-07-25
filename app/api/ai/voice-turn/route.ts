import { getOpenAI, requireAuth, buildAssistantContext, trimChatHistory, languageInstruction } from "@/lib/ai/server";
import { resolveLanguage, type AssistantLanguage } from "@/lib/ai/voice";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    if (!user) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "OpenAI API key no configurada" }, { status: 500 });
    }

    const formData = await request.formData();
    const audio = formData.get("audio");
    const language = (formData.get("language") ?? "auto") as AssistantLanguage;
    const historyRaw = formData.get("history");

    if (!(audio instanceof Blob) || audio.size === 0) {
      return Response.json({ error: "Audio requerido" }, { status: 400 });
    }

    let history: { role: string; content: string }[] = [];
    if (typeof historyRaw === "string") {
      try {
        history = JSON.parse(historyRaw);
      } catch {
        history = [];
      }
    }

    const openai = getOpenAI();
    const ext = audio.type.includes("mp4") ? "mp4" : "webm";
    const file = new File([audio], `voice.${ext}`, { type: audio.type || "audio/webm" });

    const [transcription, context] = await Promise.all([
      openai.audio.transcriptions.create({
        file,
        model: "whisper-1",
        language:
          language === "auto" ? undefined : resolveLanguage(language),
      }),
      buildAssistantContext(supabase, user.id),
    ]);

    const transcript = transcription.text.trim();
    if (!transcript) {
      return Response.json({ error: "No se detectó voz." }, { status: 400 });
    }

    const systemPrompt = `Eres Dave, asistente de construcción de NavarroConstruction.
${languageInstruction(language)}

Datos actuales del usuario:
${context}`;

    const messages = trimChatHistory([
      ...history,
      { role: "user", content: transcript },
    ]);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 350,
      temperature: 0.6,
    });

    const reply = completion.choices[0]?.message?.content ?? "Sin respuesta.";

    return Response.json({ transcript, reply });
  } catch (err) {
    console.error("Voice turn error:", err);
    return Response.json(
      { error: "Error procesando voz. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
