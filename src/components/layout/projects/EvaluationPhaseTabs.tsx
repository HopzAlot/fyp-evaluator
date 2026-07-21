import { CheckCircle2, Clock3, LockKeyhole } from "lucide-react";
import type { EvaluationPhase } from "@/types/evaluation";

type EvaluationPhaseTabsProps = {
  phases: EvaluationPhase[];
  selectedPhaseKey: string;
  progressByPhase: Record<string, number>;
  isPhaseEnabled: (phaseKey: string) => boolean;
  isPhaseCompleted: (phaseKey: string) => boolean;
  onPhaseChange: (phaseKey: string) => void;
};

export function EvaluationPhaseTabs({
  phases,
  selectedPhaseKey,
  progressByPhase,
  isPhaseEnabled,
  isPhaseCompleted,
  onPhaseChange,
}: EvaluationPhaseTabsProps) {
  const currentPhaseKey = phases.find(
    (phase) => isPhaseEnabled(phase.key) && !isPhaseCompleted(phase.key),
  )?.key;

  return (
    <section className="grid gap-3 md:grid-cols-4">
      {phases.map((phase) => {
        const selected = phase.key === selectedPhaseKey;
        const enabled = isPhaseEnabled(phase.key);
        const completed = isPhaseCompleted(phase.key);
        const inProgress = phase.key === currentPhaseKey;
        const progress = progressByPhase[phase.key] ?? 0;
        const stateStyles = completed
          ? "border-accent bg-accent-soft text-ink"
          : inProgress
            ? "border-highlight bg-highlight-soft text-ink"
            : "border-border bg-surface-muted text-muted";

        return (
          <button
            key={phase.key}
            type="button"
            disabled={!enabled}
            onClick={() => onPhaseChange(phase.key)}
            className={`rounded-md border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${stateStyles} ${
              selected ? "ring-2 ring-primary/15" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="line-clamp-1 text-sm font-semibold">
                {phase.title}
              </p>
              <span className="shrink-0 text-xs font-semibold">{progress}%</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="inline-flex items-center gap-1 font-semibold">
                {completed ? (
                  <>
                    <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                    Completed
                  </>
                ) : inProgress ? (
                  <>
                    <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                    In Progress
                  </>
                ) : (
                  <>
                    <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5" />
                    Locked
                  </>
                )}
              </span>
              <span className="shrink-0">{phase.weightage}% weightage</span>
            </div>
          </button>
        );
      })}
    </section>
  );
}
