import { PageHeader } from "@/components/dashboard/page-header";
import { clients } from "@/lib/mock-data";

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Clients"
        description="Client directory and project contacts."
        action={
          <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600">
            + Nuevo cliente
          </button>
        }
      />
      <main className="flex-1 overflow-auto p-8">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-600">
              <tr>
                <th className="px-6 py-3 font-medium">Nombre</th>
                <th className="px-6 py-3 font-medium">Empresa</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Teléfono</th>
                <th className="px-6 py-3 font-medium">Proyectos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {client.name}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{client.company}</td>
                  <td className="px-6 py-4 text-zinc-600">{client.email}</td>
                  <td className="px-6 py-4 text-zinc-600">{client.phone}</td>
                  <td className="px-6 py-4 text-zinc-900">
                    {client.projectsCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
