import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and platform preferences."
      />
      <main className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-2xl space-y-6">
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

          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-zinc-900">Notificaciones</h2>
            <div className="mt-4 space-y-3">
              {[
                "Alertas de presupuesto",
                "Recordatorios de hitos",
                "Insights de IA",
              ].map((label) => (
                <label
                  key={label}
                  className="flex items-center justify-between text-sm text-zinc-700"
                >
                  {label}
                  <input type="checkbox" defaultChecked className="size-4 rounded" />
                </label>
              ))}
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
