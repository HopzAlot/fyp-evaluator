import type { AdminFacultyUser } from "@/types/auth";

export function filterFaculty(
  faculty: AdminFacultyUser[],
  searchTerm: string,
) {
  const query = searchTerm.trim().toLowerCase();

  if (!query) {
    return faculty;
  }

  return faculty.filter((item) =>
    [
      item.fullName,
      item.email,
      item.department,
      item.designation,
      item.contactNumber,
      item.status,
    ]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(query)),
  );
}
