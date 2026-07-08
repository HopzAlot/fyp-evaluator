type AuthPageHeaderProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

export function AuthPageHeader({
  title,
  description,
  eyebrow,
}: AuthPageHeaderProps) {
  return (
    <div className="mb-9">
      <p className="text-sm font-semibold text-accent">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
