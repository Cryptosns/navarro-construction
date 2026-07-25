import type { AiInsight } from "@/lib/types";
import { priorityColors } from "@/lib/format";
import { projects } from "@/lib/mock-data";

export function AiInsightsPanel({ insights }: { insights: AiInsight[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-sm">
          ✦
        </span>
        <div>
          <h2 className="font-semibold text-zinc-900">Insights de IA</h2>
          <p className="text-xs text-zinc-500">Recomendaciones en tiempo real</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {insights.map((insight) => {
          const project = projects.find((p) => p.id === insight.projectId);
          return (
            <div
              key={insight.id}
              className={`rounded-lg border-l-4 p-3 ${priorityColors[insight.priority]}`}
            >
              <p className="text-sm font-medium text-zinc-900">
                {insight.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                {insight.description}
              </p>
              {project && (
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  {project.name}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
