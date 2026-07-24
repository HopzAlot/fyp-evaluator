import Link from "next/link";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/auth/jwt";
import { getAuthTokens } from "@/lib/auth/session";
import { getFacultyDashboardSummary } from "@/services/projectService";

export default async function DashboardPage() {
  const { accessToken, refreshToken } = await getAuthTokens();
  const payload =
    (accessToken ? verifyAccessToken(accessToken) : null) ??
    (refreshToken ? verifyRefreshToken(refreshToken) : null);
  const summary = await getFacultyDashboardSummary(
    payload?.role === "faculty" ? payload.userId : "",
  );
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
      label: "Projects started",
      value: summary.startedProjects,
      detail: "With evaluation progress",
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
              Project evaluation progress
            </h2>
            <p className="mt-1 text-sm text-muted">
              Your progress across recently imported projects
            </p>
          </div>
          <span className="rounded-md bg-accent-soft px-3 py-1 text-sm font-semibold text-ink">
            {summary.totalProjects} total
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {summary.recentProjects.length > 0 ? (
            summary.recentProjects.map((project) => {
              const progress = project.evaluationProgress;

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block rounded-md px-2 py-1.5 transition hover:bg-surface-muted"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {project.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted">
                        {progress?.currentPhase
                          ? `Current: ${progress.currentPhase}`
                          : progress?.totalPhases
                            ? "All phases completed"
                            : "Not started"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-ink">
                        {progress?.percentage ?? 0}%
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {progress?.completedPhases ?? 0}/
                        {progress?.totalPhases ?? 0} phases
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                    <span
                      className="block h-full rounded-full bg-accent"
                      style={{ width: `${progress?.percentage ?? 0}%` }}
                    />
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="py-3 text-sm text-muted">
              No projects available yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
