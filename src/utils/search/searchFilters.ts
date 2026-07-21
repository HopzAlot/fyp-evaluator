import type { AdminFacultyUser } from "@/types/faculty";
import type { Project } from "@/types/project";

type SearchableValue = string | undefined | null;

function matchesSearch(values: SearchableValue[], searchTerm: string) {
  const query = searchTerm.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return values
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLowerCase().includes(query));
}

export function filterProjects<TProject extends Project>(
  projects: TProject[],
  searchTerm: string,
) {
  return projects.filter((project) =>
    matchesSearch(
      [
        project.title,
        project.supervisor,
        project.coSupervisor,
        project.industrialPartner,
        project.sdg,
        project.status,
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
