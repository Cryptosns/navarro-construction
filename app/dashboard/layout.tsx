import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NotificationManager } from "@/components/dashboard/notification-manager";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <DashboardShell userEmail={user?.email}>
      <NotificationManager />
      {children}
    </DashboardShell>
  );
}
