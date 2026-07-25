import type { Project } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export function BudgetOverviewPanel({ projects }: { projects: Project[] }) {
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const overallUsed = Math.round((totalSpent / totalBudget) * 100);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-zinc-900">Budget Overview</h2>
      <div className="mt-4 rounded-lg bg-zinc-50 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600">Total spent</span>
          <span className="font-semibold text-zinc-900">
            {formatCurrency(totalSpent)}
          </span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-zinc-600">Total budget</span>
          <span className="font-medium text-zinc-700">
            {formatCurrency(totalBudget)}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200">
          <div
            className={`h-full rounded-full ${overallUsed > 80 ? "bg-red-500" : "bg-emerald-500"}`}
            style={{ width: `${overallUsed}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">{overallUsed}% of budget used</p>
      </div>
      <div className="mt-4 space-y-3">
        {projects.slice(0, 4).map((project) => {
          const used = Math.round((project.spent / project.budget) * 100);
          return (
            <div key={project.id}>
              <div className="flex justify-between text-xs">
                <span className="truncate text-zinc-700">{project.name}</span>
                <span className="shrink-0 font-medium text-zinc-900">{used}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full ${used > 80 ? "bg-red-400" : "bg-amber-400"}`}
                  style={{ width: `${used}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
