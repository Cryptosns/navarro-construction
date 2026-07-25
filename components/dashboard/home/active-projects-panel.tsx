import Link from "next/link";
import type { Project } from "@/lib/types";
import { formatCurrency, statusColors, statusLabels } from "@/lib/format";

export function ActiveProjectsPanel({ projects }: { projects: Project[] }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-zinc-900">Active Projects</h2>
        <Link
          href="/dashboard/projects"
          className="text-xs font-medium text-amber-600 hover:text-amber-700"
        >
          View all →
        </Link>
      </div>
      <div className="space-y-3">
        {projects.map((project) => {
          const budgetUsed = Math.round((project.spent / project.budget) * 100);
          return (
            <div
              key={project.id}
              className="rounded-lg border border-zinc-100 bg-zinc-50 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-zinc-900">{project.name}</p>
                  <p className="text-xs text-zinc-500">{project.location}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[project.status]}`}
                >
                  {statusLabels[project.status]}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                {formatCurrency(project.spent)} / {formatCurrency(project.budget)}{" "}
                ({budgetUsed}%)
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
