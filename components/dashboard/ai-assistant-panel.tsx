"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Mic, Minus, Volume2, VolumeX, X } from "lucide-react";
import { useAiAssistant } from "@/components/dashboard/ai-assistant-context";
import {
  getSpeechRecognitionLang,
  getUiStrings,
  speakText,
  stopSpeaking,
  type AssistantLanguage,
} from "@/lib/ai/voice";
import { cn } from "@/lib/utils";

const ASSISTANT_NAME = "Dave";
const ASSISTANT_ROLE = "Project Assistant";

type AiAssistantPanelProps = {
  className?: string;
  embedded?: boolean;
  mobileOverlay?: boolean;
};

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onstart: ((ev: Event) => void) | null;
  onend: ((ev: Event) => void) | null;
  onerror: ((ev: Event) => void) | null;
  onresult: ((ev: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
};

export function AiAssistantPanel({
  className,
  embedded = false,
  mobileOverlay = false,
}: AiAssistantPanelProps) {
  const { close, messages, loading, sendMessage, setMessages } =
    useAiAssistant();
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState<AssistantLanguage>("auto");
  const [speakReplies, setSpeakReplies] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const lastSpokenRef = useRef(-1);

  const ui = getUiStrings(language);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: ui.starter,
          status: "done",
        },
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
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    if (!speakReplies || loading) return;

    const lastIndex = messages.length - 1;
    const last = messages[lastIndex];
    if (
      last?.role === "assistant" &&
      last.status === "done" &&
      lastIndex > 0 &&
      lastIndex !== lastSpokenRef.current
    ) {
      lastSpokenRef.current = lastIndex;
      speakText(last.content, language);
    }
  }, [messages, loading, speakReplies, language]);

  useEffect(() => () => stopSpeaking(), []);

  function handleSend(text?: string) {
    const value = (text ?? input).trim();
    if (!value || loading) return;
    setInput("");
    sendMessage(value, language);
  }

  function toggleVoice() {
    const SpeechRecognitionCtor = (
      window as Window & {
        SpeechRecognition?: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
      }
    ).SpeechRecognition ?? (
      window as Window & {
        webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
      }
    ).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      sendMessage(ui.voiceNotSupported, language);
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    stopSpeaking();

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = getSpeechRecognitionLang(language);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) handleSend(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

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
              if (!e.target.checked) stopSpeaking();
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
            disabled={loading}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </form>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={toggleVoice}
            disabled={loading}
            className={cn(
              "flex size-14 items-center justify-center rounded-full border transition",
              listening
                ? "border-blue-600 bg-blue-50 text-blue-600 ring-4 ring-blue-100"
                : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600",
            )}
            aria-label={ui.tapToSpeak}
          >
            <Mic className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (speakReplies) stopSpeaking();
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
            {speakReplies ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-zinc-500">
          {listening ? ui.listening : ui.tapToSpeak}
        </p>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="text-sm font-medium text-blue-600 transition hover:text-blue-700 disabled:text-zinc-300"
          >
            {ui.continue}
          </button>
        </div>
      </footer>
    </aside>
  );
}
