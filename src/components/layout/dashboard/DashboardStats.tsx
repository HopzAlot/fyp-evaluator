type DashboardStat = {
  label: string;
  value: string;
  detail: string;
};

type DashboardStatsProps = {
  stats: DashboardStat[];
};

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
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
  );
}
