/** Detecta silencio tras hablar y dispara callback para parar la grabación. */
export type SilenceDetectorOptions = {
  /** Segundos de silencio tras detectar voz antes de parar */
  silenceMs?: number;
  /** Volumen mínimo considerado voz (0–1) */
  speechThreshold?: number;
  /** Tiempo mínimo grabando antes de permitir auto-stop */
  minRecordMs?: number;
  /** Debe haber voz al menos este tiempo antes de contar silencio */
  minSpeechMs?: number;
};

export function startSilenceDetection(
  stream: MediaStream,
  onSilence: () => void,
  options: SilenceDetectorOptions = {},
): () => void {
  const silenceMs = options.silenceMs ?? 1600;
  const speechThreshold = options.speechThreshold ?? 0.012;
  const minRecordMs = options.minRecordMs ?? 700;
  const minSpeechMs = options.minSpeechMs ?? 250;

  const AudioCtx =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioCtx) {
    return () => {};
  }

  const audioContext = new AudioCtx();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.85;

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  const data = new Uint8Array(analyser.fftSize);
  const startedAt = Date.now();
  let speechStartedAt: number | null = null;
  let silentSince: number | null = null;
  let stopped = false;
  let rafId = 0;

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
      if (speechStartedAt === null) speechStartedAt = now;
      silentSince = null;
    } else if (speechStartedAt !== null && now - speechStartedAt >= minSpeechMs) {
      if (silentSince === null) silentSince = now;
      else if (
        elapsed >= minRecordMs &&
        now - silentSince >= silenceMs
      ) {
        stopped = true;
        onSilence();
        return;
      }
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return () => {
    stopped = true;
    cancelAnimationFrame(rafId);
    source.disconnect();
    analyser.disconnect();
    void audioContext.close();
  };
}
