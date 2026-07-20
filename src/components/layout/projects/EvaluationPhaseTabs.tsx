import type { EvaluationPhase } from "@/types/evaluation";

type EvaluationPhaseTabsProps = {
  phases: EvaluationPhase[];
  selectedPhaseKey: string;
  progressByPhase: Record<string, number>;
  isPhaseEnabled: (phaseKey: string) => boolean;
  onPhaseChange: (phaseKey: string) => void;
};

export function EvaluationPhaseTabs({
  phases,
  selectedPhaseKey,
  progressByPhase,
  isPhaseEnabled,
  onPhaseChange,
}: EvaluationPhaseTabsProps) {
  return (
    <section className="grid gap-3 md:grid-cols-4">
      {phases.map((phase) => {
        const selected = phase.key === selectedPhaseKey;
        const enabled = isPhaseEnabled(phase.key);
        const progress = progressByPhase[phase.key] ?? 0;

        return (
          <button
            key={phase.key}
            type="button"
            disabled={!enabled}
            onClick={() => onPhaseChange(phase.key)}
            className={`rounded-md border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
              selected
                ? "border-accent bg-accent-soft text-ink"
                : "border-border bg-surface text-muted hover:border-accent hover:text-ink"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="line-clamp-1 text-sm font-semibold">
                {phase.title}
              </p>
              <span className="text-xs font-semibold">{progress}%</span>
            </div>
            <p className="mt-1 text-xs">{phase.weightage}% weightage</p>
          </button>
        );
      })}
    </section>
  );
}
