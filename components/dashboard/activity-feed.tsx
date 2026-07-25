import type { Activity } from "@/lib/types";

const activityIcons = {
  update: "📝",
  alert: "⚠️",
  milestone: "✅",
};

type ActivityFeedProps = {
  activities: Activity[];
  title?: string;
};

export function ActivityFeed({
  activities,
  title = "Recent Activity",
}: ActivityFeedProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-zinc-900">{title}</h2>
      <ul className="mt-4 space-y-4">
        {activities.map((activity) => (
          <li key={activity.id} className="flex gap-3">
            <span className="mt-0.5 text-base">{activityIcons[activity.type]}</span>
            <div>
              <p className="text-sm text-zinc-800">{activity.message}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{activity.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
