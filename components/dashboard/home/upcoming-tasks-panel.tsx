import Link from "next/link";
import type { Task } from "@/lib/types";
import { formatDate } from "@/lib/format";

const priorityStyles = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-zinc-100 text-zinc-600",
} as const;

export function UpcomingTasksPanel({ tasks }: { tasks: Task[] }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-zinc-900">Upcoming Tasks</h2>
        <Link
          href="/dashboard/calendar"
          className="text-xs font-medium text-amber-600 hover:text-amber-700"
        >
          Calendar →
        </Link>
      </div>
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-start gap-3 rounded-lg border border-zinc-100 p-3"
          >
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded border-zinc-300"
              readOnly
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900">{task.title}</p>
              <p className="mt-0.5 truncate text-xs text-zinc-500">{task.project}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-zinc-400">
                  {formatDate(task.dueDate)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityStyles[task.priority]}`}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
