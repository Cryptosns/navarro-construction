import { getOpenAI, requireAuth } from "@/lib/ai/server";
import { resolveLanguage, type AssistantLanguage } from "@/lib/ai/voice";

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth();
    if (!user) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const audio = formData.get("audio");
    const language = formData.get("language");

    if (!(audio instanceof Blob) || audio.size === 0) {
      return Response.json({ error: "Audio requerido" }, { status: 400 });
    }

    const openai = getOpenAI();
    const ext = audio.type.includes("mp4") ? "mp4" : "webm";
    const file = new File([audio], `voice.${ext}`, { type: audio.type || "audio/webm" });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language:
        language === "es" ? "es" : language === "en" ? "en" : undefined,
    });

    return Response.json({ text: transcription.text.trim() });
  } catch (err) {
    console.error("Whisper error:", err);
    return Response.json(
      { error: "No se pudo transcribir el audio." },
      { status: 500 },
    );
  }
}
