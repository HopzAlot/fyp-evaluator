import { AdminFacultyManager } from "@/components/layout/admin/AdminFacultyManager";
import { getAdminFacultyUsers } from "@/services/userService";

export default async function AdminFacultyPage() {
  const faculty = await getAdminFacultyUsers();
  const facultyKey = faculty
    .map(
      (item) =>
        `${item.id}:${item.status}:${item.fullName ?? ""}:${item.email}:${item.department ?? ""}:${item.designation ?? ""}`,
    )
    .join("|");

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Faculty users
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Review registered faculty accounts and control account access.
        </p>
      </section>

      <AdminFacultyManager key={facultyKey} initialFaculty={faculty} />
    </div>
  );
}
