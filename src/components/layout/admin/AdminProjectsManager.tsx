"use client";

import { useEffect, useMemo, useState } from "react";
import { ProjectEditRow } from "@/components/layout/admin/ProjectEditRow";
import { ProjectImportPanel } from "@/components/layout/admin/ProjectImportPanel";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import type {
  AdminProject,
  AdminProjectStatus,
  ProjectUpdateRequest,
} from "@/types/project";

const statusLabels: Record<AdminProjectStatus, string> = {
  pending: "Pending",
  "under-review": "Under Review",
  accepted: "Accepted",
  rejected: "Rejected",
};

const statusStyles: Record<AdminProjectStatus, string> = {
  pending: "bg-surface-muted text-ink",
  "under-review": "bg-primary/10 text-primary",
  accepted: "bg-accent-soft text-accent",
  rejected: "bg-danger/10 text-danger",
};

export function AdminProjectsManager() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingProject, setEditingProject] = useState<AdminProject | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = projects.length > 0 && selectedIds.length === projects.length;
  const counts = useMemo(
    () => ({
      total: projects.length,
      pending: projects.filter((project) => project.status === "pending").length,
      accepted: projects.filter((project) => project.status === "accepted").length,
    }),
    [projects],
  );

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        const response = await fetch("/api/admin/projects", {
          cache: "no-store",
        });
        const data = (await response.json()) as {
          projects?: AdminProject[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message ?? "Unable to load projects");
        }

        if (active) {
          setProjects(data.projects ?? []);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load projects",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      active = false;
    };
  }, []);

  const toggleProject = (projectId: string) => {
    setSelectedIds((currentIds) =>
      currentIds.includes(projectId)
        ? currentIds.filter((id) => id !== projectId)
        : [...currentIds, projectId],
    );
  };

  const toggleAllProjects = () => {
    setSelectedIds(allSelected ? [] : projects.map((project) => project.id));
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

  const startEdit = (project: AdminProject) => {
    setError("");
    setMessage("");
    setEditingProject(project);
  };

  const cancelEdit = () => {
    setEditingProject(null);
  };

  const saveProject = async (values: ProjectUpdateRequest) => {
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
      project?: AdminProject;
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

  const updateProjectStatus = async (
    project: AdminProject,
    status: AdminProjectStatus,
  ) => {
    if (project.status === status) {
      return;
    }

    setError("");
    setMessage("");
    setStatusUpdatingId(project.id);

    const payload: ProjectUpdateRequest = {
      title: project.title,
      students: project.students,
      supervisor: project.supervisor,
      coSupervisor: project.coSupervisor,
      industrialPartner: project.industrialPartner,
      sdg: project.sdg,
      status,
    };

    const response = await fetch(`/api/admin/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as {
      project?: AdminProject;
      message?: string;
    };

    setStatusUpdatingId("");

    if (!response.ok || !data.project) {
      setError(data.message ?? "Unable to update project status");
      return;
    }

    setProjects((currentProjects) =>
      currentProjects.map((currentProject) =>
        currentProject.id === data.project?.id ? data.project : currentProject,
      ),
    );

    if (editingProject?.id === data.project.id) {
      setEditingProject(data.project);
    }

    setMessage("Project status updated successfully.");
  };

  const renderProjectEditForm = (project: AdminProject) => {
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

  const columns: DataTableColumn<AdminProject>[] = [
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
      key: "status",
      header: "Status",
      render: (project) => (
        <select
          value={project.status}
          disabled={statusUpdatingId === project.id}
          onChange={(event) =>
            updateProjectStatus(
              project,
              event.target.value as AdminProjectStatus,
            )
          }
          className={`h-9 rounded-md border border-border px-2.5 text-xs font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-70 ${
            statusStyles[project.status]
          }`}
          aria-label={`Change status for ${project.title}`}
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
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
          <p className="mt-3 text-3xl font-semibold text-ink">
            {loading ? "--" : counts.total}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-muted">Pending</p>
          <p className="mt-3 text-3xl font-semibold text-ink">
            {loading ? "--" : counts.pending}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-muted">Accepted</p>
          <p className="mt-3 text-3xl font-semibold text-ink">
            {loading ? "--" : counts.accepted}
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
          data={projects}
          emptyMessage="No projects imported yet"
          getRowKey={(project) => project.id}
          loading={loading}
          loadingMessage="Loading projects"
          minWidth="1120px"
          renderExpandedRow={renderProjectEditForm}
        />
      </section>
    </>
  );
}
