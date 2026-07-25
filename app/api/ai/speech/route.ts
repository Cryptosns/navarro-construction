import { getOpenAI, requireAuth } from "@/lib/ai/server";
import {
  getTtsConfig,
  prepareSpeechText,
  resolveTtsVoice,
  splitSpeechChunks,
} from "@/lib/ai/tts-config";
import type { AssistantLanguage } from "@/lib/ai/voice";

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth();
    if (!user) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const rawText = typeof body.text === "string" ? body.text : "";
    const language = (body.language ?? "auto") as AssistantLanguage;

    const spoken = prepareSpeechText(rawText, language);
    if (!spoken) {
      return Response.json({ error: "Texto requerido" }, { status: 400 });
    }

    const config = getTtsConfig();
    const voice = resolveTtsVoice(language, spoken, config);
    const openai = getOpenAI();

    const chunks = splitSpeechChunks(spoken, config.maxChars);
    const buffers: Buffer[] = [];

    for (const chunk of chunks) {
      const mp3 = await openai.audio.speech.create({
        model: config.model,
        voice,
        input: chunk,
        response_format: "mp3",
        speed: config.speed,
      });
      buffers.push(Buffer.from(await mp3.arrayBuffer()));
    }

    const buffer = Buffer.concat(buffers);

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=86400",
        "X-TTS-Model": config.model,
        "X-TTS-Voice": voice,
      },
    });
  } catch (err) {
    console.error("TTS error:", err);
    return Response.json({ error: "No se pudo generar el audio." }, { status: 500 });
  }
}
