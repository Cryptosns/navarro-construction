"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Mic, Minus, Volume2, VolumeX, X } from "lucide-react";
import { useAiAssistant } from "@/components/dashboard/ai-assistant-context";
import {
  getRecordingMimeType,
  getUiStrings,
  playAssistantSpeech,
  stopAudioPlayback,
  transcribeAudio,
  type AssistantLanguage,
} from "@/lib/ai/voice";
import { cn } from "@/lib/utils";

const ASSISTANT_NAME = "Dave";
const ASSISTANT_ROLE = "Project Assistant";
const MAX_RECORD_MS = 45_000;

type VoiceState = "idle" | "recording" | "processing" | "speaking";

type AiAssistantPanelProps = {
  className?: string;
  embedded?: boolean;
  mobileOverlay?: boolean;
};

export function AiAssistantPanel({
  className,
  embedded = false,
  mobileOverlay = false,
}: AiAssistantPanelProps) {
  const { close, messages, loading, sendMessage, setMessages } =
    useAiAssistant();
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<AssistantLanguage>("auto");
  const [speakReplies, setSpeakReplies] = useState(true);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSpokenRef = useRef(-1);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ui = getUiStrings(language);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { role: "assistant", content: ui.starter, status: "done" },
      ]);
    }
  }, [messages.length, setMessages, ui.starter]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (!speakReplies || loading || voiceState === "recording") return;

    const lastIndex = messages.length - 1;
    const last = messages[lastIndex];
    if (
      last?.role === "assistant" &&
      last.status === "done" &&
      lastIndex > 0 &&
      lastIndex !== lastSpokenRef.current
    ) {
      lastSpokenRef.current = lastIndex;
      setVoiceState("speaking");
      playAssistantSpeech(last.content, language)
        .catch(() => {})
        .finally(() => setVoiceState("idle"));
    }
  }, [messages, loading, speakReplies, language, voiceState]);

  useEffect(
    () => () => {
      stopRecording(false);
      stopAudioPlayback();
    },
    [],
  );

  function handleSend(text?: string) {
    const value = (text ?? input).trim();
    if (!value || loading) return;
    setInput("");
    setVoiceHint(null);
    sendMessage(value, language);
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function stopRecording(processAudio: boolean) {
    if (recordTimeoutRef.current) {
      clearTimeout(recordTimeoutRef.current);
      recordTimeoutRef.current = null;
    }

    const recorder = recorderRef.current;
    recorderRef.current = null;

    if (recorder && recorder.state !== "inactive") {
      if (processAudio) {
        recorder.onstop = async () => {
          stopStream();
          setVoiceState("processing");
          try {
            const mime = recorder.mimeType || getRecordingMimeType();
            const blob = new Blob(chunksRef.current, { type: mime });
            chunksRef.current = [];

            if (blob.size < 800) {
              setVoiceHint(ui.voiceFailed);
              setVoiceState("idle");
              return;
            }

            const text = await transcribeAudio(blob, language);
            if (text.trim()) {
              handleSend(text);
            } else {
              setVoiceHint(ui.voiceFailed);
            }
          } catch (err) {
            setVoiceHint(
              err instanceof Error ? err.message : ui.voiceFailed,
            );
          } finally {
            setVoiceState("idle");
          }
        };
      } else {
        recorder.onstop = () => {
          stopStream();
          chunksRef.current = [];
          setVoiceState("idle");
        };
      }
      recorder.stop();
    } else {
      stopStream();
      if (!processAudio) setVoiceState("idle");
    }
  }

  async function toggleVoice() {
    if (loading || voiceState === "processing" || voiceState === "speaking") {
      return;
    }

    if (voiceState === "recording") {
      stopRecording(true);
      return;
    }

    stopAudioPlayback();
    setVoiceHint(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceHint(ui.voiceFailed);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const mimeType = getRecordingMimeType();
      const recorder = new MediaRecorder(
        stream,
        MediaRecorder.isTypeSupported(mimeType) ? { mimeType } : undefined,
      );

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorderRef.current = recorder;
      recorder.start(250);
      setVoiceState("recording");

      recordTimeoutRef.current = setTimeout(() => {
        if (recorderRef.current?.state === "recording") {
          stopRecording(true);
        }
      }, MAX_RECORD_MS);
    } catch {
      stopStream();
      setVoiceState("idle");
      setVoiceHint(ui.micDenied);
    }
  }

  const statusLabel =
    voiceState === "processing"
      ? ui.processing
      : voiceState === "speaking"
        ? ui.speaking
        : voiceState === "recording"
          ? ui.listening
          : ui.tapToSpeak;

  return (
    <aside
      className={cn(
        "flex flex-col bg-white",
        embedded
          ? "h-full w-full"
          : mobileOverlay
            ? "fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-zinc-200 shadow-[-8px_0_30px_rgba(0,0,0,0.06)] lg:static lg:z-auto lg:h-screen lg:w-[380px] lg:max-w-none lg:shrink-0"
            : "sticky top-0 h-screen w-[380px] shrink-0 border-l border-zinc-200 shadow-[-8px_0_30px_rgba(0,0,0,0.06)]",
        className,
      )}
    >
      <header className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            D
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              {ASSISTANT_NAME}
            </p>
            <p className="text-xs text-zinc-500">{ASSISTANT_ROLE}</p>
          </div>
        </div>
        {!embedded && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={close}
              className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
              aria-label="Minimize"
            >
              <Minus className="size-4" />
            </button>
            <button
              type="button"
              onClick={close}
              className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-4 py-2">
        <label className="flex items-center gap-1.5 text-xs text-zinc-600">
          <span>{ui.language}:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as AssistantLanguage)}
            className="rounded-md border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-blue-500"
          >
            <option value="auto">{ui.auto}</option>
            <option value="es">{ui.spanish}</option>
            <option value="en">{ui.english}</option>
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-xs text-zinc-600">
          <input
            type="checkbox"
            checked={speakReplies}
            onChange={(e) => {
              if (!e.target.checked) stopAudioPlayback();
              setSpeakReplies(e.target.checked);
            }}
            className="size-3.5 rounded"
          />
          {ui.speakReplies}
        </label>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === "assistant" ? (
              <div className="flex gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  D
                </div>
                <div className="min-w-0 flex-1">
                  <div className="rounded-2xl rounded-tl-md bg-zinc-100 px-3.5 py-2.5 text-sm leading-relaxed text-zinc-800">
                    {msg.content}
                  </div>
                  {msg.status === "done" && i > 0 && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600">
                      <Check className="size-3.5" />
                      {ui.done}
                    </p>
                  )}
                  {msg.status === "error" && (
                    <p className="mt-1.5 text-xs text-red-500">{ui.error}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-blue-600 px-3.5 py-2.5 text-sm leading-relaxed text-white">
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              D
            </div>
            <div className="rounded-2xl rounded-tl-md bg-zinc-100 px-3.5 py-2.5 text-sm text-zinc-500">
              {ui.thinking}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-zinc-100 px-4 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mb-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={ui.placeholder}
            disabled={loading || voiceState !== "idle"}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </form>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={toggleVoice}
            disabled={loading || voiceState === "processing" || voiceState === "speaking"}
            className={cn(
              "flex size-14 items-center justify-center rounded-full border transition",
              voiceState === "recording"
                ? "border-red-500 bg-red-50 text-red-600 ring-4 ring-red-100"
                : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600",
            )}
            aria-label={ui.tapToSpeak}
          >
            <Mic className={cn("size-6", voiceState === "recording" && "animate-pulse")} />
          </button>
          <button
            type="button"
            onClick={() => {
              stopAudioPlayback();
              setSpeakReplies((v) => !v);
            }}
            className={cn(
              "flex size-10 items-center justify-center rounded-full border transition",
              speakReplies
                ? "border-blue-200 bg-blue-50 text-blue-600"
                : "border-zinc-200 text-zinc-400",
            )}
            aria-label={ui.speakReplies}
          >
            {speakReplies ? (
              <Volume2 className="size-5" />
            ) : (
              <VolumeX className="size-5" />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-zinc-500">
          {voiceState === "recording" ? ui.tapToStop : statusLabel}
        </p>
        {voiceHint && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
            {voiceHint}
          </p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || !input.trim() || voiceState !== "idle"}
            className="text-sm font-medium text-blue-600 transition hover:text-blue-700 disabled:text-zinc-300"
          >
            {ui.continue}
          </button>
        </div>
      </footer>
    </aside>
  );
}
