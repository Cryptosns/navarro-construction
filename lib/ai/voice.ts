export type AssistantLanguage = "es" | "en" | "auto";

export function resolveLanguage(lang: AssistantLanguage): "es" | "en" {
  if (lang === "es" || lang === "en") return lang;
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("es")) {
    return "es";
  }
  return "en";
}

export function detectTextLanguage(text: string): "es" | "en" {
  if (/[áéíóúñ¿¡]/i.test(text)) return "es";
  const esHints =
    /\b(hola|gracias|proyecto|obra|presupuestos|calendario|mañana|hoy|qué|cómo|cuándo|dónde|por favor|necesito|tengo|puedes|ayuda|trabajo|evento)\b/i;
  return esHints.test(text) ? "es" : "en";
}

export function getRecordingMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) return "audio/webm;codecs=opus";
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  return "audio/mp4";
}

let activeAudio: HTMLAudioElement | null = null;

export function stopAudioPlayback(): void {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = "";
    activeAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export async function transcribeAudio(
  blob: Blob,
  language: AssistantLanguage,
): Promise<string> {
  const formData = new FormData();
  formData.append("audio", blob, "voice.webm");
  if (language !== "auto") {
    formData.append("language", resolveLanguage(language));
  }

  const res = await fetch("/api/ai/transcribe", { method: "POST", body: formData });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Error al transcribir");
  }

  return data.text ?? "";
}

export async function playAssistantSpeech(
  text: string,
  language: AssistantLanguage,
): Promise<void> {
  if (!text.trim()) return;

  stopAudioPlayback();

  const res = await fetch("/api/ai/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });

  if (!res.ok) {
    speakWithBrowser(text, language);
    return;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  activeAudio = audio;

  await new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(url);
      activeAudio = null;
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      activeAudio = null;
      reject(new Error("Audio playback failed"));
    };
    audio.play().catch(reject);
  });
}

function speakWithBrowser(text: string, lang: AssistantLanguage): void {
  if (!("speechSynthesis" in window)) return;

  const resolved = lang === "auto" ? detectTextLanguage(text) : resolveLanguage(lang);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = resolved === "es" ? "es-MX" : "en-US";
  window.speechSynthesis.speak(utterance);
}

export const uiStrings = {
  es: {
    placeholder: "Escribe un mensaje...",
    tapToSpeak: "Toca para hablar",
    tapToStop: "Toca para terminar",
    listening: "Grabando...",
    processing: "Procesando voz...",
    speaking: "Reproduciendo...",
    thinking: "Pensando...",
    continue: "Enviar",
    done: "Listo.",
    error: "Error",
    micDenied: "Permite el micrófono en Ajustes del teléfono.",
    voiceFailed: "No se pudo usar el micrófono. Intenta de nuevo.",
    speakReplies: "Respuestas por voz",
    language: "Idioma",
    auto: "Auto",
    spanish: "Español",
    english: "English",
    starter:
      "¡Hola! Puedo ayudarte con proyectos, presupuestos, materiales y tareas. Toca el micrófono y habla en español o inglés.",
  },
  en: {
    placeholder: "Type a message...",
    tapToSpeak: "Tap to speak",
    tapToStop: "Tap to stop",
    listening: "Recording...",
    processing: "Processing voice...",
    speaking: "Playing...",
    thinking: "Thinking...",
    continue: "Send",
    done: "Done.",
    error: "Error",
    micDenied: "Allow microphone access in your phone settings.",
    voiceFailed: "Could not use the microphone. Try again.",
    speakReplies: "Speak replies",
    language: "Language",
    auto: "Auto",
    spanish: "Español",
    english: "English",
    starter:
      "Hi! I can help with projects, budgets, materials and tasks. Tap the mic and speak in Spanish or English.",
  },
} as const;

export function getUiStrings(lang: AssistantLanguage) {
  return uiStrings[resolveLanguage(lang)];
}
