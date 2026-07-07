export type AuthIntroCopy = {
  eyebrow: string;
  title: string;
  description: string;
};

type AuthIntroProps = {
  compact?: boolean;
  copy: AuthIntroCopy;
};

export function AuthIntro({ compact = false, copy }: AuthIntroProps) {
  return (
    <div className={compact ? "" : "max-w-md"}>
      <p
        className={
          compact
            ? "mt-5 text-sm font-semibold uppercase text-accent"
            : "mb-4 text-sm font-semibold uppercase text-accent"
        }
      >
        {copy.eyebrow}
      </p>
      <h1
        className={
          compact
            ? "mt-2 max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl"
            : "text-4xl font-semibold leading-tight tracking-tight text-ink"
        }
      >
        {copy.title}
      </h1>
      {!compact ? (
        <p className="mt-5 text-base leading-7 text-muted">
          {copy.description}
        </p>
      ) : null}
    </div>
  );
}
