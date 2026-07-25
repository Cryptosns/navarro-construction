"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "done" | "error" | "streaming";
};

type AiAssistantContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  messages: ChatMessage[];
  loading: boolean;
  sendMessage: (text: string, language?: "es" | "en" | "auto") => Promise<void>;
  sendVoiceTurn: (
    audio: Blob,
    language?: "es" | "en" | "auto",
  ) => Promise<
    | { transcript: string; reply: string }
    | { error: string }
  >;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};

const AiAssistantContext = createContext<AiAssistantContextValue | null>(null);

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readStream(
  res: Response,
  onToken: (text: string) => void,
): Promise<void> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No stream");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6);
      if (payload === "[DONE]") return;
      try {
        const parsed = JSON.parse(payload) as { text?: string; error?: string };
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.text) onToken(parsed.text);
      } catch {
        /* skip malformed chunks */
      }
    }
  }
}

export function AiAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);

  messagesRef.current = messages;

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const sendMessage = useCallback(
    async (text: string, language: "es" | "en" | "auto" = "auto") => {
      const trimmed = text.trim();
      if (!trimmed || loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      const userMsg: ChatMessage = {
        id: newId(),
        role: "user",
        content: trimmed,
      };
      const assistantId = newId();
      const history = [...messagesRef.current, userMsg];

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: "assistant", content: "", status: "streaming" },
      ]);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map(({ role, content }) => ({ role, content })),
            language,
            stream: true,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `Error ${res.status}`);
        }

        let full = "";
        await readStream(res, (token) => {
          full += token;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: full, status: "streaming" } : m,
            ),
          );
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: full || "Sin respuesta.", status: "done" }
              : m,
          ),
        );
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    err instanceof Error ? err.message : "Something went wrong.",
                  status: "error",
                }
              : m,
          ),
        );
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [],
  );

  const sendVoiceTurn = useCallback(
    async (audio: Blob, language: "es" | "en" | "auto" = "auto") => {
      if (loadingRef.current) return { error: "Busy" };

      loadingRef.current = true;
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append("audio", audio, "voice.webm");
        formData.append("language", language);
        formData.append(
          "history",
          JSON.stringify(
            messagesRef.current.map(({ role, content }) => ({ role, content })),
          ),
        );

        const res = await fetch("/api/ai/voice-turn", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          return { error: (data.error as string) ?? "Voice error" };
        }

        const userMsg: ChatMessage = {
          id: newId(),
          role: "user",
          content: data.transcript,
        };
        const assistantMsg: ChatMessage = {
          id: newId(),
          role: "assistant",
          content: data.reply,
          status: "done",
        };

        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        return {
          transcript: data.transcript as string,
          reply: data.reply as string,
        };
      } catch (err) {
        return {
          error: err instanceof Error ? err.message : "Voice error",
        };
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      messages,
      loading,
      sendMessage,
      sendVoiceTurn,
      setMessages,
    }),
    [isOpen, open, close, toggle, messages, loading, sendMessage, sendVoiceTurn],
  );

  return (
    <AiAssistantContext.Provider value={value}>
      {children}
    </AiAssistantContext.Provider>
  );
}

export function useAiAssistant() {
  const ctx = useContext(AiAssistantContext);
  if (!ctx) {
    throw new Error("useAiAssistant must be used within AiAssistantProvider");
  }
  return ctx;
}

/** Solo acciones UI — evita re-render al escribir en el chat */
export function useAiAssistantUi() {
  const { isOpen, open, close, toggle } = useAiAssistant();
  return { isOpen, open, close, toggle };
}
