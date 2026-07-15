"use client";

import { useMemo, useState } from "react";
import { ProjectEditRow } from "@/components/layout/admin/ProjectEditRow";
import { ProjectImportPanel } from "@/components/layout/admin/ProjectImportPanel";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useRouteRefresh } from "@/hooks/useRouteRefresh";
import type { Project, ProjectInput } from "@/types/project";
import { filterProjects } from "@/utils/search/searchFilters";

type CleanupResult = {
  backfilledCount: number;
  deletedCount: number;
  deletedIds: string[];
};

type AdminProjectsManagerProps = {
  initialProjects: Project[];
};

export function AdminProjectsManager({
  initialProjects,
}: AdminProjectsManagerProps) {
  const { isRefreshing, refreshRoute } = useRouteRefresh();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cleaningOldDuplicates, setCleaningOldDuplicates] = useState(false);
  const [cleanupModalOpen, setCleanupModalOpen] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(
    null,
  );
  const [cleanupError, setCleanupError] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const filteredProjects = useMemo(
    () => filterProjects(projects, searchTerm),
    [projects, searchTerm],
  );
  const allSelected =
    filteredProjects.length > 0 &&
    filteredProjects.every((project) => selectedIdSet.has(project.id));
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

  const refreshProjects = () => {
    setError("");
    setMessage("");
    refreshRoute();
  };

  const toggleProject = (projectId: string) => {
    setSelectedIds((currentIds) =>
      currentIds.includes(projectId)
        ? currentIds.filter((id) => id !== projectId)
        : [...currentIds, projectId],
    );
  };

  const toggleAllProjects = () => {
    const visibleIds = filteredProjects.map((project) => project.id);

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
    const data = (await response.json()) as { message?: string };

    setDeleting(false);

    if (!response.ok) {
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
    };

    setDeleting(false);

    if (!response.ok) {
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

  const openCleanupModal = () => {
    setCleanupResult(null);
    setCleanupError("");
    setCleanupModalOpen(true);
  };

  const closeCleanupModal = () => {
    if (cleaningOldDuplicates) {
      return;
    }

    setCleanupModalOpen(false);
    setCleanupResult(null);
    setCleanupError("");
  };

  const cleanupOldDuplicates = async () => {
    setError("");
    setMessage("");
    setCleanupError("");
    setCleanupResult(null);
    setCleaningOldDuplicates(true);

    const response = await fetch("/api/admin/projects/cleanup-old-duplicates", {
      method: "POST",
    });
    const data = (await response.json()) as {
      backfilledCount?: number;
      deletedCount?: number;
      deletedIds?: string[];
      message?: string;
    };

    setCleaningOldDuplicates(false);

    if (!response.ok) {
      setCleanupError(data.message ?? "Unable to clean old duplicate projects");
      return;
    }

    const result = {
      backfilledCount: data.backfilledCount ?? 0,
      deletedCount: data.deletedCount ?? 0,
      deletedIds: data.deletedIds ?? [],
    };
    const deletedIds = new Set(data.deletedIds ?? []);
    setProjects((currentProjects) =>
      currentProjects.filter((project) => !deletedIds.has(project.id)),
    );
    setSelectedIds((currentIds) =>
      currentIds.filter((projectId) => !deletedIds.has(projectId)),
    );
    setCleanupResult(result);
  };

  const startEdit = (project: Project) => {
    setError("");
    setMessage("");
    setEditingProject(project);
  };

  const cancelEdit = () => {
    setEditingProject(null);
  };

  const saveProject = async (values: ProjectInput) => {
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
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => startEdit(project)}
            className="h-9 rounded-md border border-border px-3 text-sm font-semibold text-ink transition hover:bg-surface-muted"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => deleteProject(project.id)}
            disabled={deleting}
            className="h-9 rounded-md border border-border px-3 text-sm font-semibold text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:text-muted"
          >
            Delete
          </button>
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
          <Button
            type="button"
            loading={isRefreshing}
            loadingText="Refreshing"
            onClick={refreshProjects}
          >
            Refresh
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
          <button
            type="button"
            onClick={openCleanupModal}
            disabled={cleaningOldDuplicates}
            className="h-11 rounded-md border border-border px-4 text-sm font-semibold text-ink transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-muted"
          >
            {cleaningOldDuplicates ? "Cleaning" : "Clean old duplicates"}
          </button>
        </ProjectImportPanel>

        <DataTable
          columns={columns}
          data={filteredProjects}
          emptyMessage={
            searchTerm.trim()
              ? "No projects match your search"
              : "No projects imported yet"
          }
          getRowKey={(project) => project.id}
          minWidth="1120px"
          renderExpandedRow={renderProjectEditForm}
        />
      </section>

      {cleanupModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cleanup-old-duplicates-title"
            className="w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-xl"
          >
            <div>
              <h2
                id="cleanup-old-duplicates-title"
                className="text-base font-semibold text-ink"
              >
                Clean old duplicate projects
              </h2>
              <p className="mt-2 text-sm text-muted">
                This only checks old project records that do not have a project
                key. Unique old records will be backfilled, while duplicate old
                records will be deleted.
              </p>
            </div>

            {cleanupError ? (
              <p className="mt-4 rounded-md border border-danger bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
                {cleanupError}
              </p>
            ) : null}

            {cleanupResult ? (
              <div className="mt-4 rounded-md border border-border bg-background px-3 py-3">
                {cleanupResult.deletedCount > 0 ? (
                  <p className="text-sm font-medium text-ink">
                    {cleanupResult.deletedCount} old duplicate project(s) were
                    deleted.
                  </p>
                ) : (
                  <p className="text-sm font-medium text-ink">
                    No old duplicate projects were found.
                  </p>
                )}
                <p className="mt-1 text-sm text-muted">
                  {cleanupResult.backfilledCount} old project key(s) were
                  backfilled.
                </p>
              </div>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeCleanupModal}
                disabled={cleaningOldDuplicates}
                className="h-10 rounded-md border border-border px-4 text-sm font-semibold text-ink transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-muted"
              >
                Close
              </button>
              {!cleanupResult ? (
                <button
                  type="button"
                  onClick={cleanupOldDuplicates}
                  disabled={cleaningOldDuplicates}
                  className="h-10 rounded-md bg-danger px-4 text-sm font-semibold text-white transition hover:bg-danger/90 disabled:cursor-not-allowed disabled:bg-muted"
                >
                  {cleaningOldDuplicates ? "Cleaning" : "Clean duplicates"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
