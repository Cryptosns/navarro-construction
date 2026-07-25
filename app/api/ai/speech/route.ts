import { getOpenAI, requireAuth } from "@/lib/ai/server";
import { detectTextLanguage, resolveLanguage, textForSpeech, type AssistantLanguage } from "@/lib/ai/voice";

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth();
    if (!user) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const text = typeof body.text === "string" ? textForSpeech(body.text) : "";
    const language = (body.language ?? "auto") as AssistantLanguage;

    if (!text) {
      return Response.json({ error: "Texto requerido" }, { status: 400 });
    }

    const openai = getOpenAI();
    const spoken =
      language === "auto" ? detectTextLanguage(text) : resolveLanguage(language);

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: spoken === "es" ? "nova" : "alloy",
      input: text.slice(0, 600),
      response_format: "mp3",
      speed: 1.05,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("TTS error:", err);
    return Response.json({ error: "No se pudo generar el audio." }, { status: 500 });
  }
}
