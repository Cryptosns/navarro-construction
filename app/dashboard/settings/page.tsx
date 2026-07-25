import { PageHeader } from "@/components/dashboard/page-header";
import { SeedDataButton } from "@/components/dashboard/seed-data-button";
import { NotificationSettings } from "@/components/dashboard/notification-settings";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: prefs } = user
    ? await supabase
        .from("notification_preferences")
        .select("sms_enabled, phone_number, push_enabled, reminder_minutes")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and platform preferences."
      />
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <SeedDataButton />

          <NotificationSettings
            initialSmsEnabled={prefs?.sms_enabled ?? false}
            initialPhoneNumber={prefs?.phone_number ?? ""}
            initialPushEnabled={prefs?.push_enabled ?? false}
            initialReminderMinutes={prefs?.reminder_minutes ?? 60}
          />

          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-zinc-900">Perfil</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-zinc-600">
                  Correo electrónico
                </label>
                <input
                  readOnly
                  value={user?.email ?? ""}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-600">
                  Nombre completo
                </label>
                <input
                  placeholder="Tu nombre"
                  defaultValue={user?.user_metadata?.full_name ?? ""}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </section>

          <button className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600">
            Guardar cambios
          </button>
        </div>
      </main>
    </>
  );
}
