import type { AssistantLanguage } from "@/lib/ai/language";
import { detectTextLanguage, resolveLanguage } from "@/lib/ai/language";

export type TtsVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export type TtsConfig = {
  model: "tts-1" | "tts-1-hd";
  voiceEs: TtsVoice;
  voiceEn: TtsVoice;
  speed: number;
  maxChars: number;
};

/** OpenAI TTS HD — mejor calidad disponible en la API actual. */
export function getTtsConfig(): TtsConfig {
  const model =
    process.env.OPENAI_TTS_MODEL === "tts-1" ? "tts-1" : "tts-1-hd";

  const voiceEs = (process.env.OPENAI_TTS_VOICE_ES ?? "echo") as TtsVoice;
  const voiceEn = (process.env.OPENAI_TTS_VOICE_EN ?? "echo") as TtsVoice;

  const speed = Number(process.env.OPENAI_TTS_SPEED ?? "0.97");
  const maxChars = Number(process.env.OPENAI_TTS_MAX_CHARS ?? "4096");

  return {
    model,
    voiceEs,
    voiceEn,
    speed: Number.isFinite(speed) ? Math.min(1.1, Math.max(0.85, speed)) : 0.97,
    maxChars: Number.isFinite(maxChars) ? Math.min(4096, Math.max(500, maxChars)) : 4096,
  };
}

export function resolveTtsVoice(
  language: AssistantLanguage,
  text: string,
  config: TtsConfig,
): TtsVoice {
  const lang =
    language === "auto" ? detectTextLanguage(text) : resolveLanguage(language);
  return lang === "es" ? config.voiceEs : config.voiceEn;
}

/** Convierte la respuesta del asistente en texto claro para voz. */
export function prepareSpeechText(text: string, language: AssistantLanguage): string {
  const lang =
    language === "auto" ? detectTextLanguage(text) : resolveLanguage(language);

  let spoken = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/\s+/g, " ")
    .trim();

  spoken = spoken
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, " ")
    .replace(/https?:\/\/\S+/gi, lang === "es" ? " enlace " : " link ")
    .replace(/\$\s?([\d][\d,]*(?:\.\d+)?)/g, (_, amount: string) => {
      const value = amount.replace(/,/g, "");
      return lang === "es" ? `${value} dólares` : `${value} dollars`;
    })
    .replace(/(\d[\d,]*)\s*%/g, (_, n: string) => {
      const value = n.replace(/,/g, "");
      return lang === "es" ? `${value} por ciento` : `${value} percent`;
    })
    .replace(/(\d{1,2}):(\d{2})/g, (_, h: string, m: string) => {
      if (lang === "es") {
        return m === "00" ? `${h} en punto` : `${h} y ${m}`;
      }
      return m === "00" ? `${h} o'clock` : `${h} ${m}`;
    })
    .replace(/^[-•*]\s+/gm, "")
    .replace(/\s*\|\s*/g, lang === "es" ? ", " : ", ")
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .replace(/\.{2,}/g, ".")
    .trim();

  return spoken;
}

export function splitSpeechChunks(text: string, maxLen = 3800): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let rest = text;

  while (rest.length > maxLen) {
    let cut = rest.lastIndexOf(". ", maxLen);
    if (cut < maxLen * 0.5) cut = rest.lastIndexOf(" ", maxLen);
    if (cut < maxLen * 0.3) cut = maxLen;

    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }

  if (rest) chunks.push(rest);
  return chunks.filter(Boolean);
}

export function voiceReplyInstruction(language: string): string {
  const base =
    language === "es"
      ? "Las respuestas se leen en voz alta. Usa oraciones cortas y naturales."
      : language === "en"
        ? "Responses are read aloud. Use short, natural sentences."
        : "Las respuestas se leen en voz alta / Responses are read aloud. Use short natural sentences.";

  return `${base} Evita listas, markdown, símbolos, URLs y abreviaturas.`;
}
