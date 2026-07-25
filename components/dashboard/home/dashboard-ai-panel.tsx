"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const quickPrompts = [
  "Summarize active projects",
  "Any budget alerts?",
];

export function DashboardAiPanel() {
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

      const raw = await res.text();
      let data: { reply?: string; error?: string } = {};
      if (raw) data = JSON.parse(raw);

      if (!res.ok) throw new Error(data.error ?? "Request failed");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "No response." },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <h2 className="font-semibold text-zinc-900">AI Assistant</h2>
        </div>
        <Link
          href="/dashboard/assistant"
          className="text-xs font-medium text-amber-600 hover:text-amber-700"
        >
          Open full →
        </Link>
      </div>

      <div className="max-h-64 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-zinc-500">
              Ask anything about your projects, budget or schedule.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 transition hover:border-amber-300 hover:bg-amber-50"
                >
                  {prompt}
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
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-amber-500 text-white"
                    : "bg-zinc-100 text-zinc-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <p className="text-xs text-zinc-400">Thinking...</p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="flex gap-2 border-t border-zinc-100 p-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask NavarroConstruction..."
          disabled={loading}
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </section>
  );
}
