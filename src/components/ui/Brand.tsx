type BrandProps = {
  className?: string;
  compact?: boolean;
};

export function Brand({ className = "", compact = false }: BrandProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-base font-semibold text-white">
        FYP
      </div>
      <div className={compact ? "lg:hidden" : ""}>
        <p className="text-sm font-semibold text-ink">FYP Evaluator</p>
        <p className="text-sm text-muted">Academic assessment portal</p>
      </div>
    </div>
  );
}
