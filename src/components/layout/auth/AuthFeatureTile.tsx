type AuthFeatureTileProps = {
  title: string;
  description: string;
  className: string;
};

export function AuthFeatureTile({
  title,
  description,
  className,
}: AuthFeatureTileProps) {
  return (
    <div className={`border-l-2 px-4 py-3 ${className}`}>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}
