"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  "¿Qué proyectos tienen mayor riesgo de retraso?",
  "¿Cómo optimizar el presupuesto de Plaza Sur?",
  "Resume el estado general de mis obras",
];

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const text = await res.text();
      let data: { reply?: string; error?: string } = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Respuesta inválida del servidor");
        }
      }

      if (!res.ok) {
        throw new Error(data.error ?? `Error del servidor (${res.status})`);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "Sin respuesta." },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err instanceof Error
              ? err.message
              : "Ocurrió un error. Intenta de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl">
              ✦
            </div>
            <h2 className="mt-4 text-lg font-semibold text-zinc-900">
              NavarroConstruction Assistant
            </h2>
            <p className="mt-2 max-w-md text-sm text-zinc-500">
              Pregúntame sobre tus proyectos, presupuestos, riesgos o equipo.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 transition hover:border-amber-300 hover:bg-amber-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-amber-500 text-white"
                    : "border border-zinc-200 bg-white text-zinc-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500">
              Pensando...
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="border-t border-zinc-200 bg-white p-4"
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta sobre tus obras..."
            className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-auto bg-amber-500 px-4 hover:bg-amber-600"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
