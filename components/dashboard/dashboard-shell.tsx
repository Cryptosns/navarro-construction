"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
  userEmail?: string;
};

export function DashboardShell({ children, userEmail }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-zinc-100">
      <Sidebar userEmail={userEmail} activePath={pathname} />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
