import type { AdminFacultyUser } from "@/types/auth";
import type { Project, ProjectStatus } from "@/types/project";

type SearchableValue = string | undefined | null;

function matchesSearch(values: SearchableValue[], searchTerm: string) {
  const query = searchTerm.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return values
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(query));
}

type ProjectSearchOptions<TProject extends Project> = {
  getStatusLabel?: (project: TProject) => string;
};

export function filterProjects<TProject extends Project>(
  projects: TProject[],
  searchTerm: string,
  options: ProjectSearchOptions<TProject> = {},
) {
  return projects.filter((project) =>
    matchesSearch(
      [
        project.title,
        project.supervisor,
        project.coSupervisor,
        project.industrialPartner,
        project.sdg,
        options.getStatusLabel?.(project),
        "status" in project ? (project.status as ProjectStatus) : "",
        ...project.students,
      ],
      searchTerm,
    ),
  );
}

export function filterFaculty(
  faculty: AdminFacultyUser[],
  searchTerm: string,
) {
  return faculty.filter((item) =>
    matchesSearch(
      [
        item.fullName,
        item.email,
        item.department,
        item.designation,
        item.contactNumber,
        item.status,
      ],
      searchTerm,
    ),
  );
}
