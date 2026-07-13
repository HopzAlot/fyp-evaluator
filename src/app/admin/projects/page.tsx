import { AdminProjectsManager } from "@/components/layout/admin/AdminProjectsManager";

export default function AdminProjectsPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Projects
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Upload project allocations by CSV and manage imported project
            records.
          </p>
        </div>
      </section>

      <AdminProjectsManager />
    </div>
  );
}
