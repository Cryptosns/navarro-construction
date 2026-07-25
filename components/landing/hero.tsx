import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.15),_transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm text-amber-800">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          IA para construcción en tiempo real
        </div>
        <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-tight tracking-tight text-zinc-900 md:text-6xl">
          Gestiona tus obras con inteligencia artificial
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600">
          NavarroConstruction centraliza proyectos, presupuestos y equipos, y predice
          riesgos antes de que se conviertan en retrasos costosos.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:bg-amber-600"
          >
            Crear cuenta gratis
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
          >
            Conocer funciones
          </a>
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            { value: "32%", label: "Menos retrasos en obra" },
            { value: "$1.2M", label: "Ahorro promedio anual" },
            { value: "48h", label: "Detección temprana de riesgos" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <p className="text-3xl font-bold text-zinc-900">{stat.value}</p>
              <p className="mt-1 text-sm text-zinc-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
