import type { ProjectEvaluationProgress } from "@/types/project";

type ProjectProgressProps = {
  progress?: ProjectEvaluationProgress;
};

export function ProjectProgress({ progress }: ProjectProgressProps) {
  const value = progress ?? {
    percentage: 0,
    completedPhases: 0,
    totalPhases: 0,
    currentPhase: null,
  };

  return (
    <div className="w-48">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-ink">
        <span>{value.percentage}%</span>
        <span className="text-muted">
          {value.completedPhases}/{value.totalPhases} phases
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <span
          className="block h-full rounded-full bg-accent"
          style={{ width: `${value.percentage}%` }}
        />
      </div>
      <p className="mt-2 truncate text-xs text-muted">
        {value.currentPhase
          ? `Current: ${value.currentPhase}`
          : value.totalPhases > 0
            ? "All phases completed"
            : "Not started"}
      </p>
    </div>
  );
}
