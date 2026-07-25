import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

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
      return Response.json({ error: "OpenAI API key no configurada" }, { status: 500 });
    }

    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof Blob) || audio.size === 0) {
      return Response.json({ error: "Audio requerido" }, { status: 400 });
    }

    const language = formData.get("language");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const ext = audio.type.includes("mp4") ? "mp4" : audio.type.includes("wav") ? "wav" : "webm";
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
      { error: "No se pudo transcribir el audio. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
