"use client";

import { Bot, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  const { isOpen, open, close, toggle } = useAiAssistant();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isAssistantPage = pathname.startsWith("/dashboard/assistant");

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isAssistantPage) {
      open();
      return;
    }

    const mq = window.matchMedia("(min-width: 1024px)");
    const syncPanel = () => {
      if (mq.matches) open();
      else close();
    };

    syncPanel();
    mq.addEventListener("change", syncPanel);
    return () => mq.removeEventListener("change", syncPanel);
  }, [isAssistantPage, open, close]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  return (
    <div className="flex min-h-screen bg-zinc-100">
      <Sidebar
        userEmail={userEmail}
        activePath={pathname}
        mobileOpen={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900">
              NavarroConstruction
            </p>
          </div>
          {!isOpen && (
            <button
              type="button"
              onClick={toggle}
              className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
              aria-label="Open AI Assistant"
            >
              <Bot className="size-5" />
            </button>
          )}
        </header>

        <div className="flex min-w-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>

          {isOpen && !isAssistantPage && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                onClick={close}
                aria-label="Close AI Assistant"
              />
              <AiAssistantPanel mobileOverlay />
            </>
          )}
        </div>
      </div>

      {isAssistantPage && (
        <div className="fixed inset-0 z-30 flex flex-col bg-white lg:static lg:z-auto lg:w-[420px] lg:shrink-0 lg:border-l lg:border-zinc-200">
          <AiAssistantPanel embedded />
        </div>
      )}

      {!isOpen && !isAssistantPage && (
        <button
          type="button"
          onClick={toggle}
          className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 lg:hidden"
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
