import type { Project, ProjectStatus } from "@/types/project";

type ProjectSearchOptions<TProject extends Project> = {
  getStatusLabel?: (project: TProject) => string;
};

export function filterProjects<TProject extends Project>(
  projects: TProject[],
  searchTerm: string,
  options: ProjectSearchOptions<TProject> = {},
) {
  const query = searchTerm.trim().toLowerCase();

  if (!query) {
    return projects;
  }

  return projects.filter((project) => {
    const values = [
      project.title,
      project.supervisor,
      project.coSupervisor,
      project.industrialPartner,
      project.sdg,
      options.getStatusLabel?.(project),
      "status" in project ? (project.status as ProjectStatus) : "",
      ...project.students,
    ];

    return values
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });
}
