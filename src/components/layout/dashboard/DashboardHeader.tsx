type DashboardHeaderProps = {
  title: string;
  description: string;
};

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        {description}
      </p>
    </section>
  );
}
