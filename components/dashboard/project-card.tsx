import type { Project } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  statusColors,
  statusLabels,
} from "@/lib/format";

export function ProjectCard({ project }: { project: Project }) {
  const budgetUsed = Math.round((project.spent / project.budget) * 100);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-zinc-900">{project.name}</h3>
          <p className="mt-0.5 text-sm text-zinc-500">{project.location}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[project.status]}`}
        >
          {statusLabels[project.status]}
        </span>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600">Progreso</span>
          <span className="font-medium text-zinc-900">{project.progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-amber-500 transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-zinc-500">Presupuesto</p>
          <p className="font-medium text-zinc-900">
            {formatCurrency(project.budget)}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">Gastado ({budgetUsed}%)</p>
          <p className="font-medium text-zinc-900">
            {formatCurrency(project.spent)}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">Entrega</p>
          <p className="font-medium text-zinc-900">
            {formatDate(project.deadline)}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">Equipo</p>
          <p className="font-medium text-zinc-900">{project.teamSize} personas</p>
        </div>
      </div>
    </div>
  );
}
