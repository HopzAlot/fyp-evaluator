import { AdminFacultyManager } from "@/components/layout/admin/AdminFacultyManager";
import { getAdminFacultyUsers } from "@/services/userService";

export default async function AdminFacultyPage() {
  const faculty = await getAdminFacultyUsers();

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

      <AdminFacultyManager initialFaculty={faculty} />
    </div>
  );
}
