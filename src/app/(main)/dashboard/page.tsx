const stats = [
  { label: "Active projects", value: "24", detail: "Across 4 departments" },
  { label: "Pending reviews", value: "12", detail: "Awaiting faculty action" },
  { label: "Completed evaluations", value: "38", detail: "This semester" },
];

const recentItems = [
  "AI Attendance System proposal reviewed",
  "Panel assignment updated for SE-041",
  "Rubric feedback submitted for CS final demo",
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Evaluation overview
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          A quick operational view of project activity, review workload, and
          evaluation progress.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-lg border border-border bg-surface p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-muted">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-ink">{stat.value}</p>
            <p className="mt-2 text-sm text-muted">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Recent activity</h2>
            <p className="mt-1 text-sm text-muted">Latest evaluation updates</p>
          </div>
          <span className="rounded-md bg-accent-soft px-3 py-1 text-sm font-semibold text-ink">
            Live
          </span>
        </div>

        <div className="mt-5 divide-y divide-border">
          {recentItems.map((item) => (
            <p key={item} className="py-3 text-sm text-ink">
              {item}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
