type AuthFeatureTileProps = {
  title: string;
  description: string;
  tone: "accent" | "highlight";
};

export function AuthFeatureTile({
  title,
  description,
  tone,
}: AuthFeatureTileProps) {
  const toneClasses =
    tone === "accent"
      ? "border-accent bg-accent-soft"
      : "border-highlight bg-surface";

  return (
    <div className={`border-l-2 px-4 py-3 ${toneClasses}`}>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}
