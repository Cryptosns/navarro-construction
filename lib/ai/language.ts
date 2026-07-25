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
