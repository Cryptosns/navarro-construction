"use client";

import { Bot } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { AiAssistantPanel } from "@/components/dashboard/ai-assistant-panel";
import {
  AiAssistantProvider,
  useAiAssistant,
} from "@/components/dashboard/ai-assistant-context";

type DashboardShellProps = {
  children: React.ReactNode;
  userEmail?: string;
};

function DashboardShellInner({ children, userEmail }: DashboardShellProps) {
  const pathname = usePathname();
  const { isOpen, open, toggle } = useAiAssistant();
  const isAssistantPage = pathname.startsWith("/dashboard/assistant");

  useEffect(() => {
    if (isAssistantPage) open();
  }, [isAssistantPage, open]);

  return (
    <div className="flex min-h-screen bg-zinc-100">
      <Sidebar userEmail={userEmail} activePath={pathname} />

      <div className="flex min-w-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>

        {isOpen && !isAssistantPage && <AiAssistantPanel />}
      </div>

      {isAssistantPage && (
        <div className="w-[420px] shrink-0 border-l border-zinc-200 bg-white">
          <AiAssistantPanel embedded />
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={toggle}
          className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
          aria-label="Open AI Assistant"
        >
          <Bot className="size-6" />
        </button>
      )}
    </div>
  );
}

export function DashboardShell(props: DashboardShellProps) {
  return (
    <AiAssistantProvider>
      <DashboardShellInner {...props} />
    </AiAssistantProvider>
  );
}
