import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import type { FacultyProject } from "@/types/project";

type ProjectsTableProps = {
  projects: FacultyProject[];
  loading?: boolean;
};

const columns: DataTableColumn<FacultyProject>[] = [
  {
    key: "project",
    header: "Project",
    render: (project) => (
      <>
        <p className="font-semibold text-ink">{project.title}</p>
        <p className="mt-1 text-sm text-muted">
          Supervisor: {project.supervisor}
        </p>
      </>
    ),
  },
  {
    key: "students",
    header: "Students",
    render: (project) => (
      <span className="text-muted">
        {project.students.length ? project.students.join(", ") : "Not provided"}
      </span>
    ),
  },
  {
    key: "coSupervisor",
    header: "Co Supervisor",
    render: (project) => (
      <span className="text-muted">
        {project.coSupervisor || "Not provided"}
      </span>
    ),
  },
  {
    key: "partner",
    header: "Industrial Partner",
    render: (project) => (
      <span className="text-muted">
        {project.industrialPartner || "Not provided"}
      </span>
    ),
  },
  {
    key: "sdg",
    header: "SDG",
    render: (project) => (
      <span className="text-muted">{project.sdg || "Not provided"}</span>
    ),
  },
  {
    key: "action",
    header: "Action",
    className: "text-right",
    render: (project) => (
      <Link
        href={`/projects/${project.id}`}
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
      >
        Evaluate
      </Link>
    ),
  },
];

export function ProjectsTable({ projects, loading = false }: ProjectsTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <DataTable
        columns={columns}
        data={projects}
        emptyMessage="No projects assigned yet"
        getRowKey={(project) => project.id}
        loading={loading}
        loadingMessage="Loading projects"
        minWidth="1040px"
      />
    </section>
  );
}
