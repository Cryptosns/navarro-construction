import { PageHeader } from "@/components/dashboard/page-header";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ActiveProjectsPanel } from "@/components/dashboard/home/active-projects-panel";
import { UpcomingTasksPanel } from "@/components/dashboard/home/upcoming-tasks-panel";
import { BudgetOverviewPanel } from "@/components/dashboard/home/budget-overview-panel";
import { RecentPhotosPanel } from "@/components/dashboard/home/recent-photos-panel";
import { DashboardAiPanel } from "@/components/dashboard/home/dashboard-ai-panel";
import {
  recentActivity,
  recentPhotos,
  upcomingTasks,
} from "@/lib/mock-data";
import { getProjects } from "@/lib/data/queries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const projects = await getProjects(supabase);
  const activeProjects = projects.filter(
    (p) => p.status === "in_progress" || p.status === "planning",
  );

  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "User";

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${displayName}. Here's what's happening across your projects.`}
      />
      <main className="flex-1 overflow-auto p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <ActiveProjectsPanel projects={activeProjects} />
          <BudgetOverviewPanel projects={projects} />

          <ActivityFeed activities={recentActivity} title="Recent Activity" />
          <UpcomingTasksPanel tasks={upcomingTasks} />
        </div>

        <div className="mt-6">
          <RecentPhotosPanel photos={recentPhotos} />
        </div>

        <div className="mt-6">
          <DashboardAiPanel />
        </div>
      </main>
    </>
  );
}
