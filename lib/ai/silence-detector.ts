/** Detecta silencio tras hablar y dispara callback para parar la grabación. */
export type SilenceDetectorOptions = {
  /** Milisegundos de silencio tras detectar voz antes de parar */
  silenceMs?: number;
  /** Volumen mínimo considerado voz (0–1) */
  speechThreshold?: number;
  /** Tiempo mínimo grabando antes de permitir auto-stop */
  minRecordMs?: number;
  /** Debe haber voz al menos este tiempo antes de contar silencio */
  minSpeechMs?: number;
  /** Voz acumulada mínima para considerar que el usuario habló de verdad */
  minTotalSpeechMs?: number;
};

export type SilenceDetectorHandle = {
  cleanup: () => void;
  hadMeaningfulSpeech: () => boolean;
};

export function startSilenceDetection(
  stream: MediaStream,
  onSilence: () => void,
  options: SilenceDetectorOptions = {},
): SilenceDetectorHandle {
  const silenceMs = options.silenceMs ?? 1800;
  const speechThreshold = options.speechThreshold ?? 0.022;
  const minRecordMs = options.minRecordMs ?? 900;
  const minSpeechMs = options.minSpeechMs ?? 400;
  const minTotalSpeechMs = options.minTotalSpeechMs ?? 700;
  const tickMs = 100;

  const AudioCtx =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioCtx) {
    return { cleanup: () => {}, hadMeaningfulSpeech: () => false };
  }

  const audioContext = new AudioCtx();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.88;

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  const data = new Uint8Array(analyser.fftSize);
  const startedAt = Date.now();
  let speechStartedAt: number | null = null;
  let silentSince: number | null = null;
  let totalSpeechMs = 0;
  let stopped = false;
  let intervalId = 0;

  const tick = () => {
    if (stopped) return;

    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    const now = Date.now();
    const elapsed = now - startedAt;

    if (rms >= speechThreshold) {
      totalSpeechMs += tickMs;
      if (speechStartedAt === null) speechStartedAt = now;
      silentSince = null;
    } else if (speechStartedAt !== null && now - speechStartedAt >= minSpeechMs) {
      if (silentSince === null) silentSince = now;
      else if (
        elapsed >= minRecordMs &&
        totalSpeechMs >= minTotalSpeechMs &&
        now - silentSince >= silenceMs
      ) {
        stopped = true;
        onSilence();
        return;
      }
    }
  };

  intervalId = window.setInterval(tick, tickMs);

  return {
    cleanup: () => {
      stopped = true;
      clearInterval(intervalId);
      source.disconnect();
      analyser.disconnect();
      void audioContext.close();
    },
    hadMeaningfulSpeech: () => totalSpeechMs >= minTotalSpeechMs,
  };
}
