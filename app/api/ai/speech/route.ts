import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { detectTextLanguage, resolveLanguage, type AssistantLanguage } from "@/lib/ai/voice";

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

    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const language = (body.language ?? "auto") as AssistantLanguage;

    if (!text) {
      return Response.json({ error: "Texto requerido" }, { status: 400 });
    }

    const resolved =
      language === "auto" ? detectTextLanguage(text) : resolveLanguage(language);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text.slice(0, 4096),
      response_format: "mp3",
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("TTS error:", err);
    return Response.json(
      { error: "No se pudo generar el audio." },
      { status: 500 },
    );
  }
}
