"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  status?: "done" | "error";
};

type AiAssistantContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  messages: ChatMessage[];
  loading: boolean;
  sendMessage: (text: string) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};

const AiAssistantContext = createContext<AiAssistantContextValue | null>(null);

export function AiAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setLoading(true);

    const payload = await new Promise<ChatMessage[]>((resolve) => {
      setMessages((prev) => {
        const next: ChatMessage[] = [
          ...prev,
          { role: "user", content: trimmed },
        ];
        resolve(next);
        return next;
      });
    });

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });

      const raw = await res.text();
      let data: { reply?: string; error?: string } = {};

      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error("Invalid server response");
        }
      }

      if (!res.ok) {
        throw new Error(data.error ?? `Server error (${res.status})`);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply ?? "No response.",
          status: "done",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err instanceof Error ? err.message : "Something went wrong.",
          status: "error",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const value = useMemo(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      messages,
      loading,
      sendMessage,
      setMessages,
    }),
    [isOpen, open, close, toggle, messages, loading, sendMessage],
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
