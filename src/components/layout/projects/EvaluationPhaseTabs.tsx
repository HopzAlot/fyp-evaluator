type EvaluationPhaseTabsProps = {
  phases: string[];
  selectedPhase: string;
  currentPhase: string;
  progressByPhase: Record<string, number>;
  isPhaseEnabled: (phase: string) => boolean;
  onPhaseChange: (phase: string) => void;
};

export function EvaluationPhaseTabs({
  phases,
  selectedPhase,
  currentPhase,
  progressByPhase,
  isPhaseEnabled,
  onPhaseChange,
}: EvaluationPhaseTabsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      {phases.map((phase) => {
        const selected = phase === selectedPhase;
        const current = phase === currentPhase;
        const enabled = isPhaseEnabled(phase);
        const progress = progressByPhase[phase] ?? 0;

        return (
          <button
            key={phase}
            type="button"
            disabled={!enabled}
            onClick={() => onPhaseChange(phase)}
            className={`rounded-lg border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
              selected
                ? "border-accent bg-accent-soft text-ink"
                : "border-border bg-surface text-muted hover:border-accent hover:text-ink"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{phase}</p>
              <span className="text-xs font-semibold">{progress}%</span>
            </div>
            <p className="mt-1 text-xs">
              {current ? "Current phase" : enabled ? "Open" : "Locked"}
            </p>
          </button>
        );
      })}
    </section>
  );
}
