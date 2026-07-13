"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FormSelectField } from "@/components/fields/FormSelectField";
import { FormTextField } from "@/components/fields/FormTextField";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import type {
  AdminProject,
  AdminProjectStatus,
  ProjectCsvRow,
  ProjectUpdateRequest,
} from "@/types/project";
import { parseProjectCsv } from "@/utils/csv/projectCsv";
import { noHtmlValidation } from "@/utils/validation/formValidation";

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

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  label,
  value,
}));

const emptyProjectValues: ProjectUpdateRequest = {
  title: "",
  students: ["", "", "", ""],
  supervisor: "",
  coSupervisor: "",
  industrialPartner: "",
  sdg: "",
  status: "pending",
};

export function AdminProjectsManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingProject, setEditingProject] = useState<AdminProject | null>(
    null,
  );
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<ProjectCsvRow[]>([]);
  const [dropzoneOpen, setDropzoneOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = projects.length > 0 && selectedIds.length === projects.length;
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProjectUpdateRequest>({
    defaultValues: emptyProjectValues,
    mode: "onChange",
  });
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

  const previewCsv = async (file: File) => {
    setError("");
    setMessage("");

    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      setError("Only CSV files are allowed");
      return;
    }

    try {
      const rows = parseProjectCsv(await file.text());

      setPreviewFile(file);
      setPreviewRows(rows);
      setMessage(`${rows.length} project(s) ready to preview.`);
    } catch (previewError) {
      setPreviewFile(null);
      setPreviewRows([]);
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Unable to preview CSV",
      );
    }
  };

  const cancelPreview = () => {
    setPreviewFile(null);
    setPreviewRows([]);
    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const importPreview = async () => {
    if (!previewFile) {
      setError("Select a CSV file first");
      return;
    }

    setError("");
    setMessage("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", previewFile);

    const response = await fetch("/api/admin/projects/upload", {
      method: "POST",
      body: formData,
    });
    const data = (await response.json()) as {
      projects?: AdminProject[];
      message?: string;
    };

    setUploading(false);

    if (!response.ok || !data.projects) {
      setError(data.message ?? "Unable to upload projects");
      return;
    }

    setProjects((currentProjects) => [...data.projects!, ...currentProjects]);
    setMessage(`${data.projects.length} project(s) uploaded successfully.`);
    setDropzoneOpen(false);
    setPreviewFile(null);
    setPreviewRows([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files[0];

    if (file) {
      previewCsv(file);
    }
  };

  const startEdit = (project: AdminProject) => {
    setError("");
    setMessage("");
    setEditingProject(project);
    reset({
      title: project.title,
      students: [...project.students, "", "", "", ""].slice(0, 4),
      supervisor: project.supervisor,
      coSupervisor: project.coSupervisor,
      industrialPartner: project.industrialPartner,
      sdg: project.sdg,
      status: project.status,
    });
  };

  const cancelEdit = () => {
    setEditingProject(null);
    reset(emptyProjectValues);
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
    reset(emptyProjectValues);
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
      reset({
        title: data.project.title,
        students: [...data.project.students, "", "", "", ""].slice(0, 4),
        supervisor: data.project.supervisor,
        coSupervisor: data.project.coSupervisor,
        industrialPartner: data.project.industrialPartner,
        sdg: data.project.sdg,
        status: data.project.status,
      });
    }

    setMessage("Project status updated successfully.");
  };

  const renderProjectEditForm = (project: AdminProject) => {
    if (editingProject?.id !== project.id) {
      return null;
    }

    return (
      <div className="border-t border-border bg-background px-5 py-4">
        <form
          className="rounded-lg border border-border bg-surface p-4"
          noValidate
          onSubmit={handleSubmit(saveProject)}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">Edit project</h3>
              <p className="mt-1 text-sm text-muted">
                Update project details and status.
              </p>
            </div>
            <button
              type="button"
              onClick={cancelEdit}
              className="h-10 rounded-md border border-border px-3 text-sm font-semibold text-ink transition hover:bg-surface-muted"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormTextField
              control={control}
              name="title"
              label="Title"
              placeholder="Enter project title"
              rules={{
                required: "Project title is required",
                validate: noHtmlValidation,
              }}
            />
            {Array.from({ length: 4 }).map((_, index) => (
              <FormTextField
                key={index}
                control={control}
                name={`students.${index}` as const}
                label={`Student ${index + 1}`}
                placeholder={`Enter student ${index + 1}`}
                rules={{
                  required:
                    index === 0 ? "At least one student is required" : false,
                  validate: noHtmlValidation,
                }}
              />
            ))}
            <FormTextField
              control={control}
              name="supervisor"
              label="Supervisor"
              placeholder="Enter supervisor"
              rules={{
                required: "Supervisor is required",
                validate: noHtmlValidation,
              }}
            />
            <FormTextField
              control={control}
              name="coSupervisor"
              label="Co Supervisor"
              placeholder="Enter co supervisor"
              rules={{ validate: noHtmlValidation }}
            />
            <FormTextField
              control={control}
              name="industrialPartner"
              label="Industrial Partner"
              placeholder="Enter industrial partner"
              rules={{
                required: "Industrial partner is required",
                validate: noHtmlValidation,
              }}
            />
            <FormTextField
              control={control}
              name="sdg"
              label="SDG"
              placeholder="Enter SDG"
              rules={{
                required: "SDG is required",
                validate: noHtmlValidation,
              }}
            />
            <FormSelectField
              control={control}
              name="status"
              label="Status"
              options={statusOptions}
              rules={{ required: "Status is required" }}
            />
          </div>

          <Button
            type="submit"
            className="mt-4"
            loading={saving || isSubmitting}
            loadingText="Saving"
          >
            Save changes
          </Button>
        </form>
      </div>
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
        <div className="flex flex-col gap-4 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">
              Imported projects
            </h2>
            {error ? (
              <p className="mt-2 text-sm font-medium text-danger">{error}</p>
            ) : null}
            {message ? (
              <p className="mt-2 text-sm font-medium text-accent">{message}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              loading={uploading}
              loadingText="Uploading"
              onClick={() => setDropzoneOpen((current) => !current)}
            >
              Upload CSV
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
          </div>
        </div>

        {dropzoneOpen ? (
          <div className="border-b border-border bg-background px-5 py-4">
            <p className="mb-3 rounded-md border border-danger bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
              CSV format must be exactly: title, student 1, student 2, student
              3, student 4, supervisor, co supervisor, industrial partner, sdg.
              Co supervisor and extra student columns are
              optional. The first row of the CSV file should contain the column
              headers.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  previewCsv(file);
                }
              }}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center transition ${
                dragActive
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface hover:bg-surface-muted"
              }`}
            >
              <p className="text-sm font-semibold text-ink">
                Drop CSV file here
              </p>
              <p className="mt-1 text-sm text-muted">
                or click to select a file from your device
              </p>
            </div>
            {previewRows.length > 0 ? (
              <div className="mt-4 rounded-lg border border-border bg-surface">
                <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">
                      Preview import
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {previewRows.length} project(s) found in{" "}
                      {previewFile?.name}.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      loading={uploading}
                      loadingText="Importing"
                      onClick={importPreview}
                    >
                      Import
                    </Button>
                    <button
                      type="button"
                      onClick={cancelPreview}
                      className="h-11 rounded-md border border-border px-4 text-sm font-semibold text-ink transition hover:bg-surface-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div className="max-h-72 overflow-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-muted text-xs uppercase text-muted">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Title</th>
                        <th className="px-4 py-3 font-semibold">Students</th>
                        <th className="px-4 py-3 font-semibold">Supervisor</th>
                        <th className="px-4 py-3 font-semibold">
                          Co Supervisor
                        </th>
                        <th className="px-4 py-3 font-semibold">
                          Industrial Partner
                        </th>
                        <th className="px-4 py-3 font-semibold">SDG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {previewRows.map((row, index) => (
                        <tr key={`${row.title}-${index}`}>
                          <td className="px-4 py-3 font-medium text-ink">
                            {row.title}
                          </td>
                          <td className="px-4 py-3 text-muted">
                            {row.students.join(", ")}
                          </td>
                          <td className="px-4 py-3 text-muted">
                            {row.supervisor}
                          </td>
                          <td className="px-4 py-3 text-muted">
                            {row.coSupervisor || "Not provided"}
                          </td>
                          <td className="px-4 py-3 text-muted">
                            {row.industrialPartner}
                          </td>
                          <td className="px-4 py-3 text-muted">{row.sdg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

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
