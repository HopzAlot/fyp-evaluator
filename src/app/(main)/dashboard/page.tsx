import { DashboardHeader } from "@/components/layout/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/layout/dashboard/DashboardStats";
import { RecentActivity } from "@/components/layout/dashboard/RecentActivity";

const stats = [
  { label: "Active projects", value: "24", detail: "Across 4 departments" },
  { label: "Pending reviews", value: "12", detail: "Awaiting faculty action" },
  { label: "Completed evaluations", value: "38", detail: "This semester" },
];

const recentItems = [
  "AI Attendance System proposal reviewed",
  "Panel assignment updated for SE-041",
  "Rubric feedback submitted for CS final demo",
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Evaluation overview"
        description="A quick operational view of project activity, review workload, and evaluation progress."
      />
      <DashboardStats stats={stats} />
      <RecentActivity items={recentItems} />
    </div>
  );
}
