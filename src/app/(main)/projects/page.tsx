import { ProjectsTable } from "@/components/layout/projects/ProjectsTable";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/auth/jwt";
import { getAuthTokens } from "@/lib/auth/session";
import { getFacultyProjects } from "@/services/projectService";

async function getCurrentFacultyId() {
  const { accessToken, refreshToken } = await getAuthTokens();
  const payload =
    (accessToken ? verifyAccessToken(accessToken) : null) ??
    (refreshToken ? verifyRefreshToken(refreshToken) : null);

  return payload?.role === "faculty" ? payload.userId : "";
}

export default async function ProjectsPage() {
  const projects = await getFacultyProjects(await getCurrentFacultyId());

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Projects
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Review assigned FYP projects and open the evaluation workspace for
            each group.
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-muted">
          <span className="font-semibold text-ink">{projects.length}</span>{" "}
          assigned projects
        </div>
      </section>

      <ProjectsTable projects={projects} />
    </div>
  );
}
