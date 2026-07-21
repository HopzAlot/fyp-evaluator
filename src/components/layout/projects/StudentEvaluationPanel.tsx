"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EvaluationPhaseTabs } from "@/components/layout/projects/EvaluationPhaseTabs";
import type {
  EvaluationPhase,
  EvaluationPlo,
  SavedPhaseEvaluation,
  SaveProjectEvaluationRequest,
} from "@/types/evaluation";

type StudentEvaluationPanelProps = {
  projectId: string;
  students: string[];
  phases: EvaluationPhase[];
  initialPhaseKey: string;
  savedEvaluations: SavedPhaseEvaluation[];
};

type PhaseEvaluation = {
  ratings: Record<string, number>;
};

type EvaluationState = Record<string, Record<string, PhaseEvaluation>>;

const markOptions = [0, 1, 2, 3, 4, 5];
const leaveEvaluationMessage =
  "You have unsaved evaluation marks. Are you sure you want to leave this page?";

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

function createInitialEvaluations(
  savedEvaluations: SavedPhaseEvaluation[],
  phases: EvaluationPhase[],
) {
  const phaseById = new Map(phases.map((phase) => [phase.id, phase]));

  return savedEvaluations.reduce<EvaluationState>((state, savedEvaluation) => {
    const phase = phaseById.get(savedEvaluation.phaseId);

    if (!phase) {
      return state;
    }

    const ploCodeById = new Map(phase.plos.map((plo) => [plo.id, plo.code]));

    savedEvaluation.students.forEach((student) => {
      state[student.studentName] = {
        ...state[student.studentName],
        [phase.key]: {
          ratings: Object.fromEntries(
            student.evaluations
              .map((score) => {
                const ploCode = ploCodeById.get(score.ploId);

                return ploCode ? [ploCode, score.obtainedMarks] : null;
              })
              .filter((score): score is [string, number] => Boolean(score)),
          ),
        },
      };
    });

    return state;
  }, {});
}

function createInitialSavedPhaseKeys(
  savedEvaluations: SavedPhaseEvaluation[],
  phases: EvaluationPhase[],
) {
  const phaseKeyById = new Map(phases.map((phase) => [phase.id, phase.key]));

  return savedEvaluations.reduce<Record<string, boolean>>(
    (savedKeys, savedEvaluation) => {
      const phaseKey = phaseKeyById.get(savedEvaluation.phaseId);

      if (phaseKey) {
        savedEvaluation.students.forEach((student) => {
          savedKeys[`${student.studentName}-${phaseKey}`] = true;
        });
      }

      return savedKeys;
    },
    {},
  );
}

function getInitialPhaseKey(
  phases: EvaluationPhase[],
  savedEvaluationKeys: Record<string, boolean>,
  fallbackPhaseKey: string,
  studentName: string,
) {
  return (
    phases.find((phase) => !savedEvaluationKeys[`${studentName}-${phase.key}`])
      ?.key ??
    fallbackPhaseKey
  );
}

export function StudentEvaluationPanel({
  projectId,
  students,
  phases,
  initialPhaseKey,
  savedEvaluations,
}: StudentEvaluationPanelProps) {
  const initialSavedPhaseKeys = createInitialSavedPhaseKeys(
    savedEvaluations,
    phases,
  );
  const initialStudentName = students[0] ?? "";
  const [selectedPhaseKey, setSelectedPhaseKey] = useState(() =>
    getInitialPhaseKey(
      phases,
      initialSavedPhaseKeys,
      initialPhaseKey,
      initialStudentName,
    ),
  );
  const [selectedStudentName, setSelectedStudentName] =
    useState(initialStudentName);
  const [evaluations, setEvaluations] = useState<EvaluationState>(() =>
    createInitialEvaluations(savedEvaluations, phases),
  );
  const [attemptedSubmits, setAttemptedSubmits] = useState<
    Record<string, boolean>
  >({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [savedEvaluationKeys, setSavedEvaluationKeys] =
    useState<Record<string, boolean>>(initialSavedPhaseKeys);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const allowBackNavigationRef = useRef(false);
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
  const saved = savedEvaluationKeys[evaluationKey] ?? false;
  const hasUnsavedEvaluationChanges = useMemo(
    () =>
      Object.entries(evaluations).some(([studentName, phaseEvaluations]) =>
        Object.entries(phaseEvaluations).some(
          ([phaseKey, evaluation]) =>
            !savedEvaluationKeys[`${studentName}-${phaseKey}`] &&
            Object.keys(evaluation.ratings).length > 0,
        ),
      ),
    [evaluations, savedEvaluationKeys],
  );
  const selectedStudentPhaseComplete =
    getPhaseProgressForStudent(selectedStudentName, selectedPhase) === 100;

  useEffect(() => {
    if (!hasUnsavedEvaluationChanges) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    function handleLinkClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as Element | null;
      const link = target?.closest("a[href]");

      if (
        !(link instanceof HTMLAnchorElement) ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }

      const nextUrl = new URL(link.href);

      if (nextUrl.href === window.location.href) {
        return;
      }

      if (!window.confirm(leaveEvaluationMessage)) {
        event.preventDefault();
      }
    }

    function handlePopState() {
      if (allowBackNavigationRef.current) {
        return;
      }

      if (window.confirm(leaveEvaluationMessage)) {
        allowBackNavigationRef.current = true;
        window.history.back();
        return;
      }

      window.history.pushState(null, "", window.location.href);
    }

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleLinkClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleLinkClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedEvaluationChanges]);

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
    if (savedEvaluationKeys[evaluationKey]) {
      return;
    }

    setSaveError("");

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
      return;
    }

    const firstUnsavedEnabledPhase = phases.find(
      (phase) =>
        isPhaseEnabledForStudent(studentName, phase.key) &&
        !savedEvaluationKeys[`${studentName}-${phase.key}`],
    );

    if (firstUnsavedEnabledPhase) {
      setSelectedPhaseKey(firstUnsavedEnabledPhase.key);
    }
  }

  function handleSave() {
    setAttemptedSubmits((current) => ({
      ...current,
      [evaluationKey]: true,
    }));

    if (!selectedStudentPhaseComplete) {
      setSaveError(
        "Complete all PLO marks for this student before saving.",
      );
      return;
    }

    setSaveError("");
    setShowConfirmDialog(true);
  }

  function buildEvaluationPayload(): SaveProjectEvaluationRequest {
    return {
      phases: [
        {
          phaseId: selectedPhase.id,
          students: [selectedStudentName].map((studentName) => {
            const evaluation = getEvaluation(
              evaluations,
              studentName,
              selectedPhase.key,
            );
            const phaseEvaluations = selectedPhase.plos.map((plo) => ({
              ploId: plo.id,
              obtainedMarks: evaluation.ratings[plo.code],
            }));

            return {
              studentName,
              evaluations: phaseEvaluations,
              totalMarks: phaseEvaluations.reduce(
                (total, score) => total + score.obtainedMarks,
                0,
              ),
            };
          }),
        },
      ],
    };
  }

  async function confirmPhaseSave() {
    setIsSaving(true);
    setSaveError("");

    const response = await fetch(`/api/faculty/projects/${projectId}/evaluations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildEvaluationPayload()),
    });
    const data = (await response.json()) as { message?: string };

    setIsSaving(false);

    if (!response.ok) {
      setSaveError(data.message ?? "Unable to save evaluation");
      setShowConfirmDialog(false);
      return;
    }

    setSavedEvaluationKeys((current) => ({
      ...current,
      [evaluationKey]: true,
    }));
    setShowConfirmDialog(false);

    const nextUnsavedPhase = phases.find(
      (phase) =>
        isPhaseEnabledForStudent(selectedStudentName, phase.key) &&
        phase.key !== selectedPhaseKey &&
        !savedEvaluationKeys[`${selectedStudentName}-${phase.key}`],
    );

    if (nextUnsavedPhase) {
      setSelectedPhaseKey(nextUnsavedPhase.key);
    }

    console.log("Student phase evaluation saved", {
      studentName: selectedStudentName,
      phaseKey: selectedPhaseKey,
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
    <div className="space-y-4 caret-transparent">
      <EvaluationPhaseTabs
        phases={phases}
        selectedPhaseKey={selectedPhaseKey}
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
                        disabled={saved}
                        onChange={() => updateRating(criterion.code, marks)}
                        className="peer sr-only"
                      />
                      <span className="flex h-9 items-center justify-center rounded-md border border-border px-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-ink peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-ink peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
              disabled={saved}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted"
            >
              Save {selectedStudentName}
            </button>
            {saveError ? (
              <p className="text-sm font-medium text-danger">{saveError}</p>
            ) : null}
            {saved ? (
              <p className="text-sm font-semibold text-accent">
                Student evaluation saved.
              </p>
            ) : null}
          </div>
        </section>
      </form>

      {showConfirmDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <section className="w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-xl">
            <h2 className="text-base font-semibold text-ink">
              Save {selectedPhase.title}?
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Once this evaluation is saved, the entered marks for{" "}
              {selectedStudentName} in this phase cannot be changed again. Are
              you sure you want to continue?
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setShowConfirmDialog(false)}
                className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-ink transition hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={confirmPhaseSave}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-muted"
              >
                {isSaving ? "Saving..." : "Yes, save"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
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
