type AuthIntroProps = {
  compact?: boolean;
};

export function AuthIntro({ compact = false }: AuthIntroProps) {
  return (
    <div className={compact ? "" : "max-w-md"}>
      <p
        className={
          compact
            ? "mt-5 text-sm font-semibold uppercase text-accent"
            : "mb-4 text-sm font-semibold uppercase text-accent"
        }
      >
        Faculty Workspace
      </p>
      <h1
        className={
          compact
            ? "mt-2 max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl"
            : "text-4xl font-semibold leading-tight tracking-tight text-ink"
        }
      >
        Structured project evaluation for cleaner academic workflows.
      </h1>
      {!compact ? (
        <p className="mt-5 text-base leading-7 text-muted">
          Register faculty profiles, manage secure access, and keep the
          evaluation experience focused from the first screen.
        </p>
      ) : null}
    </div>
  );
}
