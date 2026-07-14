import Link from "next/link";
import { FacultyDashboardOverview } from "@/components/layout/dashboard/FacultyDashboardOverview";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Evaluation overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            A quick operational view of imported projects and the current
            evaluation workload.
          </p>
        </div>
        <Link
          href="/projects"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          View projects
        </Link>
      </section>

      <FacultyDashboardOverview />
    </div>
  );
}
