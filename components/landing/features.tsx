const features = [
  {
    title: "Predicción de riesgos",
    description:
      "La IA analiza clima, cronograma y presupuesto para alertarte antes de que surjan problemas.",
    icon: "⚡",
  },
  {
    title: "Control de presupuesto",
    description:
      "Visualiza gastos vs. presupuesto en tiempo real con alertas automáticas por proyecto.",
    icon: "📊",
  },
  {
    title: "Gestión de equipos",
    description:
      "Asigna personal, rastrea productividad y optimiza recursos entre múltiples obras.",
    icon: "👷",
  },
  {
    title: "Reportes inteligentes",
    description:
      "Genera informes de avance para clientes e inversionistas con un solo clic.",
    icon: "📋",
  },
  {
    title: "Documentación centralizada",
    description:
      "Planos, permisos y contratos en un solo lugar, accesibles desde cualquier dispositivo.",
    icon: "📁",
  },
  {
    title: "Asistente IA",
    description:
      "Pregunta sobre cualquier proyecto y recibe respuestas basadas en tus datos reales.",
    icon: "🤖",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-zinc-200 bg-zinc-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
          Todo lo que necesitas para construir mejor
        </h2>
        <p className="mt-3 max-w-2xl text-zinc-600">
          Herramientas diseñadas para constructoras, desarrolladores inmobiliarios
          y gerentes de proyecto.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
