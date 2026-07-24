"use client";

import { useMemo, useState } from "react";
import { ProjectEditRow } from "@/components/layout/admin/ProjectEditRow";
import { EvaluationExportDialog } from "@/components/layout/admin/EvaluationExportDialog";
import { ProjectImportPanel } from "@/components/layout/admin/ProjectImportPanel";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useRouteRefresh } from "@/hooks/useRouteRefresh";
import type { EvaluationPhaseOption } from "@/types/evaluation";
import type {
  Project,
  ProjectStatus,
  ProjectUpdateInput,
} from "@/types/project";
import { filterProjects } from "@/utils/search/searchFilters";

type AdminProjectsManagerProps = {
  initialProjects: Project[];
  phases: EvaluationPhaseOption[];
};

type ProjectStatusFilter = "all" | ProjectStatus;

const statusStyles: Record<ProjectStatus, string> = {
  "in progress": "border-highlight/30 bg-highlight-soft text-ink",
  completed: "border-accent/30 bg-accent-soft text-accent",
};

export function AdminProjectsManager({
  initialProjects,
  phases,
}: AdminProjectsManagerProps) {
  const { isRefreshing, refreshRoute } = useRouteRefresh();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ProjectStatusFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const filteredProjects = useMemo(
    () =>
      filterProjects(projects, searchTerm).filter(
        (project) => statusFilter === "all" || project.status === statusFilter,
      ),
    [projects, searchTerm, statusFilter],
  );
  const selectableFilteredProjects = filteredProjects.filter(
    (project) => !project.deletionPending,
  );
  const allSelected =
    selectableFilteredProjects.length > 0 &&
    selectableFilteredProjects.every((project) =>
      selectedIdSet.has(project.id),
    );
  const counts = useMemo(
    () => ({
      total: projects.length,
      students: projects.reduce(
        (count, project) => count + project.students.length,
        0,
      ),
      industry: projects.filter((project) => project.industrialPartner).length,
    }),
    [projects],
  );
  const hasPendingDeletions = projects.some(
    (project) => project.deletionPending,
  );

  const refreshProjects = () => {
    setError("");
    setMessage("");
    refreshRoute();
  };

  const exportEvaluationResults = async (selectedPhaseIds: string[]) => {
    setError("");
    setMessage("");
    setExporting(true);

    const searchParams = new URLSearchParams();

    selectedPhaseIds.forEach((phaseId) =>
      searchParams.append("phaseId", phaseId),
    );

    const response = await fetch(
      `/api/admin/projects/export-evaluations?${searchParams.toString()}`,
    );

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setError(data.message ?? "Unable to export evaluation results");
      setExporting(false);
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "fyp-evaluation-results.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    setExporting(false);
    setExportOpen(false);
    setMessage("Evaluation results exported successfully.");
  };

  const toggleProject = (projectId: string) => {
    setSelectedIds((currentIds) =>
      currentIds.includes(projectId)
        ? currentIds.filter((id) => id !== projectId)
        : [...currentIds, projectId],
    );
  };

  const toggleAllProjects = () => {
    const visibleIds = selectableFilteredProjects.map((project) => project.id);

    if (allSelected) {
      setSelectedIds((currentIds) =>
        currentIds.filter((projectId) => !visibleIds.includes(projectId)),
      );
      return;
    }

    setSelectedIds((currentIds) =>
      Array.from(new Set([...currentIds, ...visibleIds])),
    );
  };

  const deleteProject = async (projectId: string) => {
    setError("");
    setMessage("");
    setDeleting(true);

    const response = await fetch(`/api/admin/projects/${projectId}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as {
      message?: string;
      pending?: boolean;
      projectIds?: string[];
    };

    setDeleting(false);

    if (!response.ok) {
      if (data.pending) {
        const pendingIds = new Set(data.projectIds ?? [projectId]);

        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            pendingIds.has(project.id)
              ? { ...project, deletionPending: true }
              : project,
          ),
        );
        setSelectedIds((currentIds) =>
          currentIds.filter((id) => !pendingIds.has(id)),
        );
        setMessage(
          data.message ??
            "Project is still being deleted. Refresh to check its status.",
        );
        return;
      }

      setError(data.message ?? "Unable to delete project");
      return;
    }

    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== projectId),
    );
    setSelectedIds((currentIds) =>
      currentIds.filter((id) => id !== projectId),
    );
    setMessage("Project deleted successfully.");
  };

  const deleteSelectedProjects = async () => {
    if (selectedIds.length === 0) {
      setError("Select at least one project");
      return;
    }

    setError("");
    setMessage("");
    setDeleting(true);

    const response = await fetch("/api/admin/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });
    const data = (await response.json()) as {
      deletedCount?: number;
      message?: string;
      pending?: boolean;
      projectIds?: string[];
    };

    setDeleting(false);

    if (!response.ok) {
      if (data.pending) {
        const pendingIds = new Set(data.projectIds ?? selectedIds);

        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            pendingIds.has(project.id)
              ? { ...project, deletionPending: true }
              : project,
          ),
        );
        setSelectedIds([]);
        setMessage(
          data.message ??
            "Selected projects are still being deleted. Refresh to check their status.",
        );
        return;
      }

      setError(data.message ?? "Unable to delete selected projects");
      return;
    }

    const deletedIds = new Set(selectedIds);
    setProjects((currentProjects) =>
      currentProjects.filter((project) => !deletedIds.has(project.id)),
    );
    setSelectedIds([]);
    setMessage(`${data.deletedCount ?? 0} project(s) deleted successfully.`);
  };

  const startEdit = (project: Project) => {
    setError("");
    setMessage("");
    setEditingProject(project);
  };

  const cancelEdit = () => {
    setEditingProject(null);
  };

  const saveProject = async (values: ProjectUpdateInput) => {
    if (!editingProject) {
      return;
    }

    setError("");
    setMessage("");
    setSaving(true);

    const payload = {
      ...values,
      students: values.students.map((student) => student.trim()),
    };

    const response = await fetch(`/api/admin/projects/${editingProject.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as {
      project?: Project;
      message?: string;
    };

    setSaving(false);

    if (!response.ok || !data.project) {
      setError(data.message ?? "Unable to update project");
      return;
    }

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === data.project?.id ? data.project : project,
      ),
    );
    setEditingProject(null);
    setMessage("Project updated successfully.");
  };

  const renderProjectEditForm = (project: Project) => {
    if (editingProject?.id !== project.id) {
      return null;
    }

    return (
      <ProjectEditRow
        project={project}
        saving={saving}
        onCancel={cancelEdit}
        onSave={saveProject}
      />
    );
  };

  const columns: DataTableColumn<Project>[] = [
    {
      key: "select",
      header: "",
      render: (project) => (
        <input
          type="checkbox"
          checked={selectedIdSet.has(project.id)}
          onChange={() => toggleProject(project.id)}
          disabled={project.deletionPending}
          className="h-4 w-4 rounded border-border accent-primary"
          aria-label={`Select ${project.title}`}
        />
      ),
    },
    {
      key: "title",
      header: "Title",
      render: (project) => (
        <span className="font-semibold text-ink">{project.title}</span>
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
      key: "supervisor",
      header: "Supervisor",
      render: (project) => (
        <span className="text-muted">{project.supervisor}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (project) => (
        <span
          className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold capitalize ${
            project.deletionPending
              ? "border-highlight/30 bg-highlight-soft text-ink"
              : statusStyles[project.status]
          }`}
        >
          {project.deletionPending ? "Deletion pending" : project.status}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      className: "text-right",
      render: (project) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => startEdit(project)}
            disabled={project.deletionPending}
            className="h-9 rounded-md border border-border px-3 text-sm font-semibold text-ink transition hover:bg-surface-muted"
          >
            Edit
          </button>
          {!project.deletionPending ? (
            <button
              type="button"
              onClick={() => deleteProject(project.id)}
              disabled={deleting}
              className="h-9 rounded-md border border-border px-3 text-sm font-semibold text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:text-muted"
            >
              Delete
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-muted">Total projects</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{counts.total}</p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-muted">Project students</p>
          <p className="mt-3 text-3xl font-semibold text-ink">
            {counts.students}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-muted">Industry linked</p>
          <p className="mt-3 text-3xl font-semibold text-ink">
            {counts.industry}
          </p>
        </article>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <ProjectImportPanel
          header={
            <div>
              <h2 className="text-base font-semibold text-ink">
                Imported projects
              </h2>
              {error ? (
                <p className="mt-2 text-sm font-medium text-danger">{error}</p>
              ) : null}
              {message ? (
                <p className="mt-2 text-sm font-medium text-accent">
                  {message}
                </p>
              ) : null}
              {hasPendingDeletions ? (
                <p className="mt-2 text-sm font-medium text-highlight">
                  Pending projects will be deleted after their evaluations are
                  removed. Refresh to check their status.
                </p>
              ) : null}
            </div>
          }
          onError={setError}
          onImported={(importedProjects) =>
            setProjects((currentProjects) => [
              ...importedProjects,
              ...currentProjects,
            ])
          }
          onMessage={setMessage}
        >
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search projects"
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15 sm:w-72"
          />
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as ProjectStatusFilter)
            }
            className="h-11 rounded-md border border-border bg-background px-3 text-sm font-medium text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            aria-label="Filter projects by status"
          >
            <option value="all">All statuses</option>
            <option value="in progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          <Button
            type="button"
            loading={isRefreshing}
            loadingText="Refreshing"
            onClick={refreshProjects}
          >
            Refresh
          </Button>
          <Button
            type="button"
            onClick={() => {
              setError("");
              setMessage("");
              setExportOpen(true);
            }}
            className="bg-accent hover:bg-accent"
          >
            Export evaluation results
          </Button>
          <button
            type="button"
            onClick={toggleAllProjects}
            className="h-11 rounded-md border border-border px-4 text-sm font-semibold text-ink transition hover:bg-surface-muted"
          >
            {allSelected ? "Clear selection" : "Select all"}
          </button>
          <button
            type="button"
            onClick={deleteSelectedProjects}
            disabled={deleting || selectedIds.length === 0}
            className="h-11 rounded-md border border-border px-4 text-sm font-semibold text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:text-muted"
          >
            Delete selected
          </button>
        </ProjectImportPanel>

        <DataTable
          columns={columns}
          data={filteredProjects}
          emptyMessage={
            searchTerm.trim() || statusFilter !== "all"
              ? "No projects match your filters"
              : "No projects imported yet"
          }
          getRowKey={(project) => project.id}
          minWidth="900px"
          renderExpandedRow={renderProjectEditForm}
        />
      </section>

      {exportOpen ? (
        <EvaluationExportDialog
          phases={phases}
          exporting={exporting}
          error={error}
          onClose={() => setExportOpen(false)}
          onExport={exportEvaluationResults}
        />
      ) : null}

    </>
  );
}
