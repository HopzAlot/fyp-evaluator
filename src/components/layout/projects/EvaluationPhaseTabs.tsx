type EvaluationPhaseTabsProps = {
  phases: string[];
  activePhase: string;
};

export function EvaluationPhaseTabs({
  phases,
  activePhase,
}: EvaluationPhaseTabsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      {phases.map((phase) => {
        const active = phase === activePhase;

        return (
          <div
            key={phase}
            className={`rounded-lg border p-4 ${
              active
                ? "border-accent bg-accent-soft text-ink"
                : "border-border bg-surface text-muted"
            }`}
          >
            <p className="text-sm font-semibold">{phase}</p>
            <p className="mt-1 text-xs">
              {active ? "Current phase" : "Upcoming review"}
            </p>
          </div>
        );
      })}
    </section>
  );
}
