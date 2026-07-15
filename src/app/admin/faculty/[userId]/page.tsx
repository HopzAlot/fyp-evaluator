import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFacultyEditForm } from "@/components/layout/admin/AdminFacultyEditForm";
import { getAdminFacultyUserById } from "@/services/userService";

type AdminFacultyEditPageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function AdminFacultyEditPage({
  params,
}: AdminFacultyEditPageProps) {
  const { userId } = await params;
  const faculty = await getAdminFacultyUserById(userId);

  if (!faculty) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/admin/faculty"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Back to users
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
            {faculty.fullName ?? faculty.email}
          </h1>
          <p className="mt-2 text-sm text-muted">{faculty.email}</p>
        </div>
      </section>

      <AdminFacultyEditForm faculty={faculty} />
    </div>
  );
}
