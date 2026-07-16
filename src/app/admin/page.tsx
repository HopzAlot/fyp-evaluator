import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/auth/jwt";
import { getAuthTokens } from "@/lib/auth/session";
import { getAdminProjects } from "@/services/projectService";
import {
  getAdminFacultyUsers,
  getUserById,
} from "@/services/userService";
import type { AdminFacultyUser } from "@/types/faculty";
import type { Project } from "@/types/project";

const recentFacultyColumns: DataTableColumn<AdminFacultyUser>[] = [
  {
    key: "name",
    header: "Name",
    render: (item) => (
      <span className="font-medium text-ink">
        {item.fullName ?? "Not provided"}
      </span>
    ),
  },
  {
    key: "email",
    header: "Email",
    render: (item) => <span className="text-muted">{item.email}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (item) => (
      <span className="rounded-md border border-border bg-surface-muted px-2 py-1 text-xs font-semibold capitalize text-ink">
        {item.status}
      </span>
    ),
  },
];

const recentProjectColumns: DataTableColumn<Project>[] = [
  {
    key: "title",
    header: "Project",
    render: (item) => <span className="font-medium text-ink">{item.title}</span>,
  },
  {
    key: "students",
    header: "Students",
    render: (item) => (
      <span className="text-muted">{item.students.join(", ")}</span>
    ),
  },
  {
    key: "supervisor",
    header: "Supervisor",
    render: (item) => <span className="text-muted">{item.supervisor}</span>,
  },
];

async function getAdminUser() {
  const { accessToken, refreshToken } = await getAuthTokens();
  const payload =
    (accessToken ? verifyAccessToken(accessToken) : null) ??
    (refreshToken ? verifyRefreshToken(refreshToken) : null);

  if (!payload) {
    return null;
  }

  return getUserById(payload.userId);
}

export default async function AdminDashboardPage() {
  const [faculty, projects, adminUser] = await Promise.all([
    getAdminFacultyUsers(),
    getAdminProjects(),
    getAdminUser(),
  ]);
  const activeFaculty = faculty.filter((item) => item.status === "active");
  const inactiveFaculty = faculty.filter((item) => item.status === "inactive");
  const recentFaculty = faculty.slice(0, 5);
  const recentProjects = projects.slice(0, 5);
  const stats = [
    { label: "Total projects", value: projects.length },
    { label: "Total faculty", value: faculty.length },
    { label: "Active faculty", value: activeFaculty.length },
    { label: "Inactive faculty", value: inactiveFaculty.length },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Admin dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Monitor projects, faculty access, and the main admin workflows.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-lg border border-border bg-surface p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-muted">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-ink">
              {stat.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-ink">
                Recent faculty
              </h2>
              <p className="mt-1 text-sm text-muted">
                Latest registered faculty users and approval status.
              </p>
            </div>
            <Link
              href="/admin/faculty"
              className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-ink transition hover:bg-surface-muted"
            >
              Manage users
            </Link>
          </div>
          <DataTable
            columns={recentFacultyColumns}
            data={recentFaculty}
            emptyMessage="No faculty users found"
            getRowKey={(item) => item.id}
            minWidth="680px"
          />
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">Quick actions</h2>
            <div className="mt-4 grid gap-3">
              <Link
                href="/admin/projects"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover"
              >
                Upload projects
              </Link>
              <Link
                href="/admin/faculty"
                className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 text-sm font-semibold text-ink transition hover:bg-surface-muted"
              >
                Manage users
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">Admin profile</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="font-medium text-muted">Name</p>
                <p className="mt-1 font-semibold text-ink">
                  {adminUser?.fullName || "Not provided"}
                </p>
              </div>
              <div>
                <p className="font-medium text-muted">Email</p>
                <p className="mt-1 break-all font-semibold text-ink">
                  {adminUser?.email ?? "Not available"}
                </p>
              </div>
            </div>
            <Link
              href="/profile"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-ink transition hover:bg-surface-muted"
            >
              View profile
            </Link>
          </section>
        </aside>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">
              Recent projects
            </h2>
            <p className="mt-1 text-sm text-muted">
              Latest uploaded projects available for evaluation.
            </p>
          </div>
          <Link
            href="/admin/projects"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-ink transition hover:bg-surface-muted"
          >
            View projects
          </Link>
        </div>
        <DataTable
          columns={recentProjectColumns}
          data={recentProjects}
          emptyMessage="No projects found"
          getRowKey={(item) => item.id}
          minWidth="760px"
        />
      </section>
    </div>
  );
}
