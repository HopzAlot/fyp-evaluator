type RecentActivityProps = {
  items: string[];
};

export function RecentActivity({ items }: RecentActivityProps) {
  return (
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
        {items.map((item) => (
          <p key={item} className="py-3 text-sm text-ink">
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}
