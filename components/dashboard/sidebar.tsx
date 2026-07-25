import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠", exact: true },
  { href: "/dashboard/projects", label: "Projects", icon: "📁" },
  { href: "/dashboard/calendar", label: "Calendar", icon: "📅" },
  { href: "/dashboard/documents", label: "Documents", icon: "📄" },
  { href: "/dashboard/estimates", label: "Estimates", icon: "💰" },
  { href: "/dashboard/receipts", label: "Upload Receipts", icon: "📷" },
  { href: "/dashboard/reports", label: "Reports", icon: "📊" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  { href: "/dashboard/assistant", label: "AI Assistant", icon: "🤖" },
];

type SidebarProps = {
  userEmail?: string;
  activePath?: string;
};

export function Sidebar({ userEmail, activePath = "/dashboard" }: SidebarProps) {
  return (
    <aside className="flex w-64 flex-col border-r border-zinc-200 bg-zinc-950 text-white">
      <div className="border-b border-zinc-800 p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold">
            NC
          </div>
          <div>
            <p className="font-semibold">NavarroConstruction</p>
            <p className="text-xs text-zinc-400">Control panel</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = item.exact
            ? activePath === item.href
            : activePath.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-amber-500/15 text-amber-400"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-3 border-t border-zinc-800 p-4">
        {userEmail && (
          <p className="truncate text-xs text-zinc-500">{userEmail}</p>
        )}
        <LogoutButton />
      </div>
    </aside>
  );
}
