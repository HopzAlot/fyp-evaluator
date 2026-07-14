"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import type { FacultyProject } from "@/types/project";
import { filterProjects } from "@/utils/search/searchFilters";

type ProjectsTableProps = {
  projects: FacultyProject[];
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

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProjects = useMemo(
    () => filterProjects(projects, searchTerm),
    [projects, searchTerm],
  );

  const refreshProjects = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">
            Assigned projects
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search projects"
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15 sm:w-72"
          />
          <Button
            type="button"
            loading={isPending}
            loadingText="Refreshing"
            onClick={refreshProjects}
          >
            Refresh
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={filteredProjects}
        emptyMessage={
          searchTerm.trim()
            ? "No projects match your search"
            : "No projects assigned yet"
        }
        getRowKey={(project) => project.id}
        minWidth="1040px"
      />
    </section>
  );
}
