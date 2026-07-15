"use client";

import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import type { Project, ProjectInput } from "@/types/project";
import { parseProjectCsv } from "@/utils/csv/projectCsv";

const csvColumns = [
  { name: "title", required: true },
  { name: "student 1", required: true },
  { name: "student 2", required: true },
  { name: "student 3", required: false },
  { name: "student 4", required: false },
  { name: "supervisor", required: true },
  { name: "co supervisor", required: false },
  { name: "industrial partner", required: true },
  { name: "sdg", required: true },
];

type ProjectImportPanelProps = {
  children?: ReactNode;
  header: ReactNode;
  onImported: (projects: Project[]) => void;
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
  const [previewRows, setPreviewRows] = useState<ProjectInput[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importError, setImportError] = useState("");
  const [importMessage, setImportMessage] = useState("");

  const resetImportState = () => {
    setPreviewFile(null);
    setPreviewRows([]);
    setDragActive(false);
    setImportError("");
    setImportMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeImportPanel = () => {
    if (uploading) {
      return;
    }

    setImportOpen(false);
    resetImportState();
  };

  const previewCsv = async (file: File) => {
    setImportError("");
    setImportMessage("");

    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      setImportError("Only CSV files are allowed");
      return;
    }

    try {
      const rows = parseProjectCsv(await file.text());

      setPreviewFile(file);
      setPreviewRows(rows);
      setImportMessage(`${rows.length} project(s) ready to preview.`);
    } catch (previewError) {
      setPreviewFile(null);
      setPreviewRows([]);
      setImportError(
        previewError instanceof Error
          ? previewError.message
          : "Unable to preview CSV",
      );
    }
  };

  const cancelPreview = () => {
    setPreviewFile(null);
    setPreviewRows([]);
    setImportMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const importPreview = async () => {
    if (!previewFile) {
      setImportError("Select a CSV file first");
      return;
    }

    setImportError("");
    setImportMessage("");
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
      projects?: Project[];
      skippedCount?: number;
      message?: string;
    };

    setUploading(false);

    if (!response.ok || !data.projects) {
      setImportError(data.message ?? "Unable to upload projects");
      return;
    }

    onImported(data.projects);
    setImportMessage(
      data.skippedCount
        ? `${data.projects.length} project(s) uploaded successfully. ${data.skippedCount} duplicate project(s) skipped.`
        : `${data.projects.length} project(s) uploaded successfully.`,
    );
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
            onClick={() => {
              resetImportState();
              setImportOpen(true);
            }}
          >
            Upload CSV
          </Button>
          {children}
        </div>
      </div>

      {importOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-import-title"
            className="max-h-full w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-surface shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <h2
                  id="project-import-title"
                  className="text-base font-semibold text-ink"
                >
                  Upload projects CSV
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Add projects by uploading a CSV file with the required
                  headers.
                </p>
              </div>
              <button
                type="button"
                onClick={closeImportPanel}
                disabled={uploading}
                className="h-9 rounded-md border border-border px-3 text-sm font-semibold text-ink transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-muted"
              >
                Close
              </button>
            </div>

            <div className="max-h-[calc(100vh-160px)] overflow-auto px-5 py-4">
              <div className="rounded-lg border border-highlight bg-highlight-soft p-4">
                <p className="text-sm font-semibold text-ink">
                  CSV header format must match this reference.
                </p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="border-b border-highlight/30 text-xs uppercase text-ink">
                      <tr>
                        {csvColumns.map((column) => (
                          <th key={column.name} className="px-3 py-2 font-semibold">
                            {column.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-muted">
                        {csvColumns.map((column) => (
                          <td key={column.name} className="px-3 py-2">
                            {column.required ? "Required" : "Optional"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {importError ? (
                <p className="mt-4 rounded-md border border-danger bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
                  {importError}
                </p>
              ) : null}

              {importMessage ? (
                <p className="mt-4 rounded-md border border-accent bg-accent-soft px-3 py-2 text-sm font-medium text-ink">
                  {importMessage}
                </p>
              ) : null}

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
                className={`mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center transition ${
                  dragActive
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background hover:bg-surface-muted"
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
                        disabled={uploading}
                        className="h-11 rounded-md border border-border px-4 text-sm font-semibold text-ink transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-muted"
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
