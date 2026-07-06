type AuthPageHeaderProps = {
  title: string;
  description: string;
};

export function AuthPageHeader({ title, description }: AuthPageHeaderProps) {
  return (
    <div className="mb-8">
      <p className="text-sm font-semibold text-accent">Faculty Portal</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
