import Link from "next/link";
import type { Project, ProjectStatus } from "@/data/projects";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";

type ProjectsTableProps = {
  projects: Project[];
};

const statusStyles: Record<ProjectStatus, string> = {
  Ready: "bg-accent-soft text-accent",
  "In Review": "bg-surface-muted text-ink",
  Submitted: "bg-primary/10 text-primary",
};

const columns: DataTableColumn<Project>[] = [
  {
    key: "project",
    header: "Project",
    render: (project) => (
      <>
        <p className="font-semibold text-ink">{project.title}</p>
        <p className="mt-1 text-sm text-muted">
          {project.department} - {project.supervisor}
        </p>
      </>
    ),
  },
  {
    key: "students",
    header: "Students",
    render: (project) => (
      <span className="text-muted">
        {project.members.map((student) => student.name).join(", ")}
      </span>
    ),
  },
  {
    key: "phase",
    header: "Phase",
    render: (project) => <span className="text-ink">{project.phase}</span>,
  },
  {
    key: "progress",
    header: "Progress",
    render: (project) => (
      <div className="flex items-center gap-3">
        <div className="h-2 w-28 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <span className="font-medium text-ink">{project.progress}%</span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (project) => (
      <span
        className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
          statusStyles[project.status]
        }`}
      >
        {project.status}
      </span>
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

export function ProjectsTable({ projects }: ProjectsTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <DataTable
        columns={columns}
        data={projects}
        getRowKey={(project) => project.id}
      />
    </section>
  );
}
