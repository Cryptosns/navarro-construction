/** Frases típicas que Whisper inventa con silencio o ruido de fondo. */
const HALLUCINATION_PATTERNS: RegExp[] = [
  /^thank(s| you)( for watching)?[.!]?$/i,
  /^thanks for listening[.!]?$/i,
  /^please subscribe[.!]?$/i,
  /^subscribe to (the )?channel[.!]?$/i,
  /subtitles? by/i,
  /amara\.org/i,
  /translated by/i,
  /transcri(?:ption|bed) by/i,
  /^gracias por ver/i,
  /^suscríbete/i,
  /^♪/,
  /^\[.*\]$/,
  /^\.{2,}$/,
  /^you\.?$/i,
  /^bye\.?$/i,
  /^okay\.?$/i,
  /^ok\.?$/i,
  /^hmm+\.?$/i,
  /^um+\.?$/i,
  /^ah+\.?$/i,
  /^oh+\.?$/i,
  /^www\./i,
  /\.com\b/i,
  /^music$/i,
  /^silence$/i,
  /^silencio$/i,
];

export type TranscriptQuality = {
  noSpeechProb?: number;
  avgLogprob?: number;
  durationSec?: number;
};

export function isLikelyHallucination(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return true;
  if (normalized.length < 2) return true;

  return HALLUCINATION_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function isValidUserTranscript(
  text: string,
  quality: TranscriptQuality = {},
): boolean {
  const normalized = text.trim();
  if (!normalized || normalized.length < 3) return false;

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;

  // Una sola letra o símbolo suelto no cuenta como mensaje.
  if (words.length === 1 && words[0].length < 3) return false;

  if (isLikelyHallucination(normalized)) return false;

  if (quality.noSpeechProb !== undefined && quality.noSpeechProb > 0.55) {
    return false;
  }

  if (quality.avgLogprob !== undefined && quality.avgLogprob < -1.05) {
    return false;
  }

  if (
    quality.durationSec !== undefined &&
    quality.durationSec < 0.35 &&
    words.length > 4
  ) {
    return false;
  }

  return true;
}
