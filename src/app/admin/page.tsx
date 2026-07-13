import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Admin dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Manage faculty access and monitor evaluator administration.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Admin actions</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Use the faculty page to review registered faculty users and update
          their account status.
        </p>
        <Link
          href="/admin/faculty"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          Manage faculty
        </Link>
      </section>
    </div>
  );
}
