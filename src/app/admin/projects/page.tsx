import { AdminProjectsManager } from "@/components/layout/admin/AdminProjectsManager";
import { getAdminProjects } from "@/services/projectService";

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects();
  const projectsKey = projects
    .map(
      (project) =>
        `${project.id}:${project.status}:${project.evaluationProgress.percentage}:${project.evaluationProgress.completedPhases}:${project.evaluationProgress.totalPhases}:${project.evaluationProgress.currentPhase ?? ""}`,
    )
    .join("|");

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Projects
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Upload project allocations by CSV and manage imported project
            records.
          </p>
        </div>
      </section>

      <AdminProjectsManager key={projectsKey} initialProjects={projects} />
    </div>
  );
}
