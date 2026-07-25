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

/** Quita markdown básico para TTS. */
export function textForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getRecordingMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) return "audio/webm;codecs=opus";
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  return "audio/mp4";
}

let sharedAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;
const ttsCache = new Map<string, string>();

function ttsCacheKey(text: string, lang: AssistantLanguage): string {
  return `${lang}:${text.slice(0, 200)}`;
}

function getSharedAudioElement(): HTMLAudioElement {
  if (typeof document === "undefined") {
    return new Audio();
  }
  if (!sharedAudio) {
    sharedAudio = document.createElement("audio");
    sharedAudio.setAttribute("playsinline", "true");
    sharedAudio.setAttribute("webkit-playsinline", "true");
    sharedAudio.preload = "auto";
    sharedAudio.volume = 1;
    sharedAudio.style.display = "none";
    document.body.appendChild(sharedAudio);
  }
  return sharedAudio;
}

/** iOS requiere desbloquear audio con un gesto del usuario (tap en mic). */
export async function unlockAudioPlayback(): Promise<void> {
  if (audioUnlocked) return;
  const audio = getSharedAudioElement();
  try {
    audio.src =
      "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
    audioUnlocked = true;
  } catch {
    /* se reintentará al reproducir respuesta */
  }
}

export function stopAudioPlayback(): void {
  const audio = sharedAudio;
  if (audio) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
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
  const spoken = textForSpeech(text);
  if (!spoken) return;

  stopAudioPlayback();
  await unlockAudioPlayback();

  const cacheKey = ttsCacheKey(spoken, language);
  const cached = ttsCache.get(cacheKey);
  if (cached) {
    const audio = getSharedAudioElement();
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Playback failed"));
      audio.src = cached;
      audio.play().catch(reject);
    });
    return;
  }

  const res = await fetch("/api/ai/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: spoken, language }),
  });

  if (!res.ok) {
    const ok = speakWithBrowser(spoken, language);
    if (!ok) throw new Error("No se pudo reproducir el audio");
    return;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  ttsCache.set(cacheKey, url);
  if (ttsCache.size > 20) {
    const first = ttsCache.keys().next().value;
    if (first) {
      URL.revokeObjectURL(ttsCache.get(first)!);
      ttsCache.delete(first);
    }
  }

  const audio = getSharedAudioElement();

  await new Promise<void>((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Error al reproducir"));
    audio.src = url;
    audio.load();
    audio.play().then(() => {
      audioUnlocked = true;
    }).catch(reject);
  });
}

function speakWithBrowser(text: string, lang: AssistantLanguage): boolean {
  if (!("speechSynthesis" in window)) return false;

  const resolved = lang === "auto" ? detectTextLanguage(text) : resolveLanguage(lang);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = resolved === "es" ? "es-MX" : "en-US";
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

export const uiStrings = {
  es: {
    placeholder: "Escribe un mensaje...",
    tapToSpeak: "Toca para hablar",
    tapToStop: "Toca para terminar",
    autoStopHint: "Se detiene solo cuando dejas de hablar",
    listening: "Grabando...",
    processing: "Procesando voz...",
    speaking: "Reproduciendo...",
    thinking: "Pensando...",
    continue: "Enviar",
    done: "Listo.",
    error: "Error",
    micDenied: "Permite el micrófono en Ajustes del teléfono.",
    voiceFailed: "No se pudo usar el micrófono. Intenta de nuevo.",
    noSpeechDetected:
      "No detecté voz clara. Habla más cerca del micrófono y un poco más fuerte.",
    audioFailed: "No se escuchó la respuesta. Toca 🔊 en el mensaje o sube el volumen.",
    replay: "Escuchar",
    speakReplies: "Respuestas por voz",
    language: "Idioma",
    auto: "Auto",
    spanish: "Español",
    english: "English",
    starter:
      "¡Hola! Toca el micrófono, habla, y me detengo solo cuando termines. Respondo en español o inglés.",
  },
  en: {
    placeholder: "Type a message...",
    tapToSpeak: "Tap to speak",
    tapToStop: "Tap to stop",
    autoStopHint: "Stops automatically when you finish speaking",
    listening: "Recording...",
    processing: "Processing voice...",
    speaking: "Playing...",
    thinking: "Thinking...",
    continue: "Send",
    done: "Done.",
    error: "Error",
    micDenied: "Allow microphone access in your phone settings.",
    voiceFailed: "Could not use the microphone. Try again.",
    noSpeechDetected:
      "No clear speech detected. Speak closer to the mic and a bit louder.",
    audioFailed: "Could not play the reply. Tap 🔊 on the message or turn up volume.",
    replay: "Listen",
    speakReplies: "Speak replies",
    language: "Language",
    auto: "Auto",
    spanish: "Español",
    english: "English",
    starter:
      "Hi! Tap the mic, speak, and I stop automatically when you finish. I reply in Spanish or English.",
  },
} as const;

export function getUiStrings(lang: AssistantLanguage) {
  return uiStrings[resolveLanguage(lang)];
}
