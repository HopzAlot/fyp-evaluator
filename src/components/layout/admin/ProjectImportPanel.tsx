"use client";

import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import type { AdminProject, ProjectCsvRow } from "@/types/project";
import { parseProjectCsv } from "@/utils/csv/projectCsv";

type ProjectImportPanelProps = {
  children?: ReactNode;
  header: ReactNode;
  onImported: (projects: AdminProject[]) => void;
  onError: (message: string) => void;
  onMessage: (message: string) => void;
};

export function ProjectImportPanel({
  children,
  header,
  onImported,
  onError,
  onMessage,
}: ProjectImportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<ProjectCsvRow[]>([]);
  const [dropzoneOpen, setDropzoneOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const previewCsv = async (file: File) => {
    onError("");
    onMessage("");

    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      onError("Only CSV files are allowed");
      return;
    }

    try {
      const rows = parseProjectCsv(await file.text());

      setPreviewFile(file);
      setPreviewRows(rows);
      onMessage(`${rows.length} project(s) ready to preview.`);
    } catch (previewError) {
      setPreviewFile(null);
      setPreviewRows([]);
      onError(
        previewError instanceof Error
          ? previewError.message
          : "Unable to preview CSV",
      );
    }
  };

  const cancelPreview = () => {
    setPreviewFile(null);
    setPreviewRows([]);
    onMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const importPreview = async () => {
    if (!previewFile) {
      onError("Select a CSV file first");
      return;
    }

    onError("");
    onMessage("");
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
      onError(data.message ?? "Unable to upload projects");
      return;
    }

    onImported(data.projects);
    onMessage(`${data.projects.length} project(s) uploaded successfully.`);
    setDropzoneOpen(false);
    setPreviewFile(null);
    setPreviewRows([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files[0];

    if (file) {
      previewCsv(file);
    }
  };

  return (
    <div className="border-b border-border">
      <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        {header}
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            loading={uploading}
            loadingText="Uploading"
            onClick={() => setDropzoneOpen((current) => !current)}
          >
            Upload CSV
          </Button>
          {children}
        </div>
      </div>

      {dropzoneOpen ? (
        <div className="border-t border-border bg-background px-5 py-4">
          <p className="mb-3 rounded-md border border-danger bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
            CSV format must be exactly: title, student 1, student 2, student 3,
            student 4, supervisor, co supervisor, industrial partner, sdg. Co
            supervisor and extra student columns are optional. The first row of
            the CSV file should contain the column headers.
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
            <p className="text-sm font-semibold text-ink">Drop CSV file here</p>
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
    </div>
  );
}
