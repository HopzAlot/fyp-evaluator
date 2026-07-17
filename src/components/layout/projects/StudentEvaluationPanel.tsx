"use client";

import { useMemo, useState } from "react";
import { EvaluationPhaseTabs } from "@/components/layout/projects/EvaluationPhaseTabs";
import type { EvaluationPhase, EvaluationPlo } from "@/types/evaluation";

type StudentEvaluationPanelProps = {
  students: string[];
  phases: EvaluationPhase[];
  initialPhaseKey: string;
};

type PhaseEvaluation = {
  ratings: Record<string, number>;
};

type EvaluationState = Record<string, Record<string, PhaseEvaluation>>;

const markOptions = [0, 1, 2, 3, 4, 5];

function createEmptyEvaluation(): PhaseEvaluation {
  return {
    ratings: {},
  };
}

function getEvaluation(
  evaluations: EvaluationState,
  studentName: string,
  phaseKey: string,
) {
  return evaluations[studentName]?.[phaseKey] ?? createEmptyEvaluation();
}

function getCompletion(evaluation: PhaseEvaluation, criteriaCount: number) {
  if (criteriaCount === 0) {
    return 0;
  }

  return Math.round(
    (Object.keys(evaluation.ratings).length / criteriaCount) * 100,
  );
}

function getOverallStudentProgress(
  evaluations: EvaluationState,
  studentName: string,
  phases: EvaluationPhase[],
) {
  const totalCriteria = phases.reduce(
    (count, phase) => count + phase.plos.length,
    0,
  );

  if (totalCriteria === 0) {
    return 0;
  }

  const completedCriteria = phases.reduce(
    (count, phase) =>
      count +
      Object.keys(getEvaluation(evaluations, studentName, phase.key).ratings)
        .length,
    0,
  );

  return Math.round((completedCriteria / totalCriteria) * 100);
}

function formatMarkingCriteria(description: string) {
  return description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function StudentEvaluationPanel({
  students,
  phases,
  initialPhaseKey,
}: StudentEvaluationPanelProps) {
  const [selectedPhaseKey, setSelectedPhaseKey] = useState(initialPhaseKey);
  const [selectedStudentName, setSelectedStudentName] = useState(students[0] ?? "");
  const [evaluations, setEvaluations] = useState<EvaluationState>({});
  const [attemptedSubmits, setAttemptedSubmits] = useState<
    Record<string, boolean>
  >({});
  const [savedEvaluations, setSavedEvaluations] = useState<
    Record<string, boolean>
  >({});
  const selectedPhase =
    phases.find((phase) => phase.key === selectedPhaseKey) ?? phases[0];
  const selectedCriteria = selectedPhase?.plos ?? [];
  const selectedEvaluation = getEvaluation(
    evaluations,
    selectedStudentName,
    selectedPhaseKey,
  );

  const phaseProgress = useMemo(
    () =>
      phases.reduce<Record<string, number>>((progress, phase) => {
        progress[phase.key] = getCompletion(
          getEvaluation(evaluations, selectedStudentName, phase.key),
          phase.plos.length,
        );

        return progress;
      }, {}),
    [evaluations, phases, selectedStudentName],
  );

  const evaluationKey = `${selectedStudentName}-${selectedPhaseKey}`;
  const showErrors = attemptedSubmits[evaluationKey] ?? false;
  const saved = savedEvaluations[evaluationKey] ?? false;

  function getPhaseProgressForStudent(studentName: string, phase: EvaluationPhase) {
    return getCompletion(
      getEvaluation(evaluations, studentName, phase.key),
      phase.plos.length,
    );
  }

  function isPhaseEnabledForStudent(studentName: string, phaseKey: string) {
    const phaseIndex = phases.findIndex((phase) => phase.key === phaseKey);

    if (phaseIndex <= 0) {
      return true;
    }

    return phases
      .slice(0, phaseIndex)
      .every(
        (previousPhase) =>
          getPhaseProgressForStudent(studentName, previousPhase) === 100,
      );
  }

  function isPhaseEnabled(phaseKey: string) {
    return isPhaseEnabledForStudent(selectedStudentName, phaseKey);
  }

  function updateEvaluation(updates: Partial<PhaseEvaluation>) {
    setSavedEvaluations((current) => ({
      ...current,
      [evaluationKey]: false,
    }));

    setEvaluations((current) => {
      const currentEvaluation = getEvaluation(
        current,
        selectedStudentName,
        selectedPhaseKey,
      );

      return {
        ...current,
        [selectedStudentName]: {
          ...current[selectedStudentName],
          [selectedPhaseKey]: {
            ...currentEvaluation,
            ...updates,
          },
        },
      };
    });
  }

  function updateRating(ploCode: string, marks: number) {
    updateEvaluation({
      ratings: {
        ...selectedEvaluation.ratings,
        [ploCode]: marks,
      },
    });
  }

  function handlePhaseChange(phaseKey: string) {
    if (isPhaseEnabled(phaseKey)) {
      setSelectedPhaseKey(phaseKey);
    }
  }

  function handleStudentChange(studentName: string) {
    setSelectedStudentName(studentName);

    if (!isPhaseEnabledForStudent(studentName, selectedPhaseKey)) {
      const firstOpenPhase =
        phases.find((phase) => isPhaseEnabledForStudent(studentName, phase.key)) ??
        phases[0];

      setSelectedPhaseKey(firstOpenPhase.key);
    }
  }

  function handleSave() {
    setAttemptedSubmits((current) => ({
      ...current,
      [evaluationKey]: true,
    }));

    if ((phaseProgress[selectedPhaseKey] ?? 0) !== 100) {
      return;
    }

    setSavedEvaluations((current) => ({
      ...current,
      [evaluationKey]: true,
    }));

    console.log("Student evaluation saved", {
      studentName: selectedStudentName,
      phase: selectedPhase,
      evaluation: selectedEvaluation,
    });
  }

  if (!selectedPhase) {
    return (
      <section className="rounded-lg border border-border bg-surface p-5 text-sm text-muted shadow-sm">
        No evaluation phases found.
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <EvaluationPhaseTabs
        phases={phases}
        selectedPhaseKey={selectedPhaseKey}
        currentPhaseKey={initialPhaseKey}
        progressByPhase={phaseProgress}
        isPhaseEnabled={isPhaseEnabled}
        onPhaseChange={handlePhaseChange}
      />

      <form className="grid gap-4 xl:grid-cols-[17rem_1fr]">
        <aside>
          <section className="rounded-md border border-border bg-surface p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-ink">Students</h2>
            <p className="mt-1 text-xs text-muted">
              Overall evaluation progress
            </p>
            <div className="mt-3 space-y-2">
              {students.map((student) => {
                const active = student === selectedStudentName;
                const progress = getOverallStudentProgress(
                  evaluations,
                  student,
                  phases,
                );

                return (
                  <button
                    key={student}
                    type="button"
                    onClick={() => handleStudentChange(student)}
                    className={`w-full rounded-md border px-3 py-2.5 text-left transition ${
                      active
                        ? "border-accent bg-accent-soft"
                        : "border-border bg-background hover:border-accent"
                    }`}
                  >
                    <span className="block truncate text-sm font-semibold text-ink">
                      {student}
                    </span>
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-surface-muted">
                      <span
                        className="block h-full rounded-full bg-accent"
                        style={{ width: `${progress}%` }}
                      />
                    </span>
                    <span className="mt-1.5 block text-xs text-muted">
                      {progress}% overall
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </aside>

        <section className="space-y-3">
          <div className="flex flex-col gap-2 rounded-md border border-border bg-surface px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-primary">
                {selectedPhase.title}
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink">
                {selectedStudentName}
              </h2>
            </div>
            <p className="text-xs text-muted">
              Mark each PLO from 0 to 5
            </p>
          </div>

          {selectedCriteria.length === 0 ? (
            <section className="rounded-md border border-border bg-surface p-4 text-sm text-muted shadow-sm">
              No PLOs configured for this phase yet.
            </section>
          ) : null}

          {selectedCriteria.map((criterion, index) => {
            const missingRating =
              showErrors && selectedEvaluation.ratings[criterion.code] === undefined;

            return (
              <fieldset
                key={`${selectedPhase.key}-${selectedStudentName}-${criterion.code}`}
                className={`rounded-md border bg-surface px-4 py-3 shadow-sm ${
                  missingRating ? "border-danger" : "border-border"
                }`}
              >
                <legend className="flex w-full items-center gap-3 text-base font-semibold text-ink">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-muted text-xs">
                    {index + 1}
                  </span>
                  <span className="leading-6">{criterion.title}</span>
                </legend>

                <MarkingCriteria criterion={criterion} />

                <div className="mt-3 grid grid-cols-6 gap-2">
                  {markOptions.map((marks) => (
                    <label key={marks} className="cursor-pointer">
                      <input
                        type="radio"
                        name={`${selectedPhase.key}-${selectedStudentName}-${criterion.code}`}
                        value={marks}
                        checked={selectedEvaluation.ratings[criterion.code] === marks}
                        onChange={() => updateRating(criterion.code, marks)}
                        className="peer sr-only"
                      />
                      <span className="flex h-9 items-center justify-center rounded-md border border-border px-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-ink peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-ink">
                        {marks}
                      </span>
                    </label>
                  ))}
                </div>
                {missingRating ? (
                  <p className="mt-3 text-sm text-danger">
                    Select marks for this PLO.
                  </p>
                ) : null}
              </fieldset>
            );
          })}

          <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
            >
              Save {selectedPhase.title} evaluation
            </button>
            {saved ? (
              <p className="text-sm font-semibold text-accent">
                Evaluation saved.
              </p>
            ) : null}
          </div>
        </section>
      </form>
    </div>
  );
}

function MarkingCriteria({ criterion }: { criterion: EvaluationPlo }) {
  const lines = formatMarkingCriteria(criterion.description);

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 border-l-2 border-border pl-3">
      <p className="text-xs font-semibold uppercase text-muted">
        Marking criteria
      </p>
      <div className="mt-2 grid gap-1.5">
        {lines.map((line) => {
          const [range, ...descriptionParts] = line.split(":");
          const description = descriptionParts.join(":").trim();

          return (
            <div
              key={line}
              className="grid gap-1 rounded-md bg-surface-muted px-2.5 py-2 text-xs text-muted sm:grid-cols-[3.5rem_1fr]"
            >
              <span className="font-semibold text-ink">{range.trim()}</span>
              <span>{description || "Criteria not added yet."}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
