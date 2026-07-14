import Link from "next/link";
import { getFacultyDashboardSummary } from "@/services/projectService";

export default async function DashboardPage() {
  const summary = await getFacultyDashboardSummary();
  const stats = [
    {
      label: "Available projects",
      value: summary.totalProjects,
      detail: "Ready for faculty evaluation",
    },
    {
      label: "Project students",
      value: summary.totalStudents,
      detail: "Across imported groups",
    },
    {
      label: "Industry linked",
      value: summary.industryProjects,
      detail: "Projects with industrial partners",
    },
  ];

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

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-lg border border-border bg-surface p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-muted">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-ink">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-muted">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-ink">
              Recent projects
            </h2>
            <p className="mt-1 text-sm text-muted">
              Latest imported project records
            </p>
          </div>
          <span className="rounded-md bg-accent-soft px-3 py-1 text-sm font-semibold text-ink">
            {summary.totalProjects} total
          </span>
        </div>

        <div className="mt-5 divide-y divide-border">
          {summary.recentProjects.length > 0 ? (
            summary.recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block py-3 transition hover:bg-surface-muted"
              >
                <p className="text-sm font-semibold text-ink">
                  {project.title}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {project.students.length} student(s) - Supervisor:{" "}
                  {project.supervisor}
                </p>
              </Link>
            ))
          ) : (
            <p className="py-3 text-sm text-muted">
              No projects imported yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
