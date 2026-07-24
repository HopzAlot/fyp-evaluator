type BrandProps = {
  className?: string;
  compact?: boolean;
};

export function Brand({ className = "", compact = false }: BrandProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-white shadow-sm">
        <svg
          viewBox="0 0 40 40"
          aria-hidden="true"
          className="h-9 w-9"
        >
          <path
            d="M5 12.5 19 6l14 6.5L19 19 5 12.5Z"
            fill="currentColor"
          />
          <path
            d="M10 16.5v5c0 2.7 4 5 9 5 1.6 0 3.1-.2 4.4-.7M33 12.5v8"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.5"
          />
          <path
            d="M11 30v3M16 28v5M21 26v7"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.5"
          />
          <circle cx="29.5" cy="29.5" r="7" className="fill-accent" />
          <path
            d="m26.2 29.5 2.1 2.1 4.5-4.7"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
          />
        </svg>
      </div>
      <div className={compact ? "lg:hidden" : ""}>
        <p className="text-sm font-semibold text-ink">FYP Evaluator</p>
        <p className="text-sm text-muted">Academic assessment portal</p>
      </div>
    </div>
  );
}
