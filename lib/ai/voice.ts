export type AssistantLanguage = "es" | "en" | "auto";

export function resolveLanguage(lang: AssistantLanguage): "es" | "en" {
  if (lang === "es" || lang === "en") return lang;
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("es")) {
    return "es";
  }
  return "en";
}

export function getSpeechRecognitionLang(lang: AssistantLanguage): string {
  return resolveLanguage(lang) === "es" ? "es-MX" : "en-US";
}

export function getSpeechSynthesisLang(lang: AssistantLanguage): string {
  return resolveLanguage(lang) === "es" ? "es-MX" : "en-US";
}

/** Heurística simple cuando el modo es auto y ya tenemos texto. */
export function detectTextLanguage(text: string): "es" | "en" {
  if (/[áéíóúñ¿¡]/i.test(text)) return "es";
  const esHints =
    /\b(hola|gracias|proyecto|obra|presupuesto|calendario|mañana|hoy|qué|cómo|cuándo|dónde|por favor|necesito|tengo|puedes|ayuda)\b/i;
  return esHints.test(text) ? "es" : "en";
}

export function pickVoice(lang: "es" | "en"): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang === "es" ? "es" : "en";
  return (
    voices.find((v) => v.lang.replace("_", "-").startsWith(`${prefix}-MX`)) ??
    voices.find((v) => v.lang.replace("_", "-").startsWith(`${prefix}-US`)) ??
    voices.find((v) => v.lang.replace("_", "-").startsWith(prefix)) ??
    null
  );
}

export function speakText(text: string, lang: AssistantLanguage): void {
  if (!("speechSynthesis" in window) || !text.trim()) return;

  window.speechSynthesis.cancel();
  const resolved =
    lang === "auto" ? detectTextLanguage(text) : resolveLanguage(lang);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getSpeechSynthesisLang(resolved);
  const voice = pickVoice(resolved);
  if (voice) utterance.voice = voice;
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export const uiStrings = {
  es: {
    placeholder: "Escribe un mensaje...",
    tapToSpeak: "Toca para hablar",
    listening: "Escuchando...",
    thinking: "Pensando...",
    continue: "Enviar",
    done: "Listo.",
    error: "Error",
    voiceNotSupported: "Tu navegador no soporta entrada de voz.",
    speakReplies: "Respuestas por voz",
    language: "Idioma",
    auto: "Auto",
    spanish: "Español",
    english: "English",
    starter:
      "¡Hola! Puedo ayudarte con proyectos, presupuestos, materiales y tareas. ¿Qué necesitas?",
  },
  en: {
    placeholder: "Type a message...",
    tapToSpeak: "Tap to speak",
    listening: "Listening...",
    thinking: "Thinking...",
    continue: "Send",
    done: "Done.",
    error: "Error",
    voiceNotSupported: "Voice input is not supported in this browser.",
    speakReplies: "Speak replies",
    language: "Language",
    auto: "Auto",
    spanish: "Español",
    english: "English",
    starter:
      "Hi! I can help you manage projects, budgets, materials and tasks. What would you like to do?",
  },
} as const;

export function getUiStrings(lang: AssistantLanguage) {
  return uiStrings[resolveLanguage(lang)];
}
