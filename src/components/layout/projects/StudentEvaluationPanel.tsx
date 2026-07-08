"use client";

import { useMemo, useState } from "react";
import { EvaluationPhaseTabs } from "@/components/layout/projects/EvaluationPhaseTabs";
import type { Student } from "@/data/projects";

type StudentEvaluationPanelProps = {
  students: Student[];
  criteria: string[];
  phases: string[];
  initialPhase: string;
};

type PhaseEvaluation = {
  ratings: Record<number, string>;
  remarks: string;
  recommendation: string;
};

type EvaluationState = Record<string, Record<string, PhaseEvaluation>>;

const ratingOptions = ["Excellent", "Good", "Average", "Redo"];

function createEmptyEvaluation(): PhaseEvaluation {
  return {
    ratings: {},
    remarks: "",
    recommendation: "",
  };
}

function getEvaluation(
  evaluations: EvaluationState,
  studentId: string,
  phase: string,
) {
  return evaluations[studentId]?.[phase] ?? createEmptyEvaluation();
}

function getCompletion(evaluation: PhaseEvaluation, criteriaCount: number) {
  const ratedCriteria = Object.keys(evaluation.ratings).length;
  const remarksDone = evaluation.remarks.trim() ? 1 : 0;
  const recommendationDone = evaluation.recommendation ? 1 : 0;
  const totalFields = criteriaCount + 2;

  return Math.round(
    ((ratedCriteria + remarksDone + recommendationDone) / totalFields) * 100,
  );
}

export function StudentEvaluationPanel({
  students,
  criteria,
  phases,
  initialPhase,
}: StudentEvaluationPanelProps) {
  const [selectedPhase, setSelectedPhase] = useState(initialPhase);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id);
  const [evaluations, setEvaluations] = useState<EvaluationState>({});
  const [attemptedSubmits, setAttemptedSubmits] = useState<
    Record<string, boolean>
  >({});
  const [savedEvaluations, setSavedEvaluations] = useState<
    Record<string, boolean>
  >({});

  const selectedStudent =
    students.find((student) => student.id === selectedStudentId) ?? students[0];

  const selectedEvaluation = getEvaluation(
    evaluations,
    selectedStudent.id,
    selectedPhase,
  );

  const phaseProgress = useMemo(
    () =>
      phases.reduce<Record<string, number>>((progress, phase) => {
        progress[phase] = getCompletion(
          getEvaluation(evaluations, selectedStudent.id, phase),
          criteria.length,
        );

        return progress;
      }, {}),
    [criteria.length, evaluations, phases, selectedStudent.id],
  );

  const selectedStudentProgress = phaseProgress[selectedPhase] ?? 0;
  const evaluationKey = `${selectedStudent.id}-${selectedPhase}`;
  const showErrors = attemptedSubmits[evaluationKey] ?? false;
  const saved = savedEvaluations[evaluationKey] ?? false;

  function getPhaseProgressForStudent(studentId: string, phase: string) {
    return getCompletion(
      getEvaluation(evaluations, studentId, phase),
      criteria.length,
    );
  }

  function isPhaseEnabledForStudent(studentId: string, phase: string) {
    const phaseIndex = phases.indexOf(phase);

    if (phaseIndex <= 0) {
      return true;
    }

    return phases
      .slice(0, phaseIndex)
      .every(
        (previousPhase) =>
          getPhaseProgressForStudent(studentId, previousPhase) === 100,
      );
  }

  function isPhaseEnabled(phase: string) {
    return isPhaseEnabledForStudent(selectedStudent.id, phase);
  }

  function updateEvaluation(updates: Partial<PhaseEvaluation>) {
    setSavedEvaluations((current) => ({
      ...current,
      [evaluationKey]: false,
    }));

    setEvaluations((current) => {
      const currentEvaluation = getEvaluation(
        current,
        selectedStudent.id,
        selectedPhase,
      );

      return {
        ...current,
        [selectedStudent.id]: {
          ...current[selectedStudent.id],
          [selectedPhase]: {
            ...currentEvaluation,
            ...updates,
          },
        },
      };
    });
  }

  function updateRating(criterionIndex: number, rating: string) {
    updateEvaluation({
      ratings: {
        ...selectedEvaluation.ratings,
        [criterionIndex]: rating,
      },
    });
  }

  function handlePhaseChange(phase: string) {
    if (isPhaseEnabled(phase)) {
      setSelectedPhase(phase);
    }
  }

  function handleStudentChange(studentId: string) {
    setSelectedStudentId(studentId);

    if (!isPhaseEnabledForStudent(studentId, selectedPhase)) {
      const firstOpenPhase =
        phases.find((phase) => isPhaseEnabledForStudent(studentId, phase)) ??
        phases[0];

      setSelectedPhase(firstOpenPhase);
    }
  }

  function handleSave() {
    setAttemptedSubmits((current) => ({
      ...current,
      [evaluationKey]: true,
    }));

    if (selectedStudentProgress !== 100) {
      return;
    }

    setSavedEvaluations((current) => ({
      ...current,
      [evaluationKey]: true,
    }));

    console.log("Student evaluation saved", {
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      phase: selectedPhase,
      evaluation: selectedEvaluation,
    });
  }

  return (
    <div className="space-y-6">
      <EvaluationPhaseTabs
        phases={phases}
        selectedPhase={selectedPhase}
        currentPhase={initialPhase}
        progressByPhase={phaseProgress}
        isPhaseEnabled={isPhaseEnabled}
        onPhaseChange={handlePhaseChange}
      />

      <form className="grid gap-6 xl:grid-cols-[20rem_1fr]">
        <aside className="space-y-4">
          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">Students</h2>
            <p className="mt-1 text-sm text-muted">
              Showing {selectedPhase} completion
            </p>
            <div className="mt-4 space-y-3">
              {students.map((student) => {
                const active = student.id === selectedStudent.id;
                const studentEvaluation = getEvaluation(
                  evaluations,
                  student.id,
                  selectedPhase,
                );
                const progress = getCompletion(
                  studentEvaluation,
                  criteria.length,
                );

                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => handleStudentChange(student.id)}
                    className={`w-full rounded-md border px-3 py-3 text-left transition ${
                      active
                        ? "border-accent bg-accent-soft"
                        : "border-border bg-background hover:border-accent"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-ink">
                      {student.name}
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      {student.rollNo} - {progress}% done
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">
              Selected student
            </h2>
            <p className="mt-3 text-sm font-semibold text-ink">
              {selectedStudent.name}
            </p>
            <p className="mt-1 text-sm text-muted">{selectedStudent.rollNo}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${selectedStudentProgress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              {selectedStudentProgress}% complete in {selectedPhase}
            </p>
          </section>
        </aside>

        <section className="space-y-4">
          {criteria.map((criterion, index) => {
            const missingRating = showErrors && !selectedEvaluation.ratings[index];

            return (
              <fieldset
                key={`${selectedPhase}-${selectedStudent.id}-${criterion}`}
                className={`rounded-lg border bg-surface p-5 shadow-sm ${
                  missingRating ? "border-danger" : "border-border"
                }`}
              >
                <legend className="flex w-full items-center gap-3 text-base font-semibold text-ink">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-muted text-sm">
                    {index + 1}
                  </span>
                  {criterion}
                </legend>

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  {ratingOptions.map((rating) => (
                    <label key={rating} className="cursor-pointer">
                      <input
                        type="radio"
                        name={`${selectedPhase}-${selectedStudent.id}-criterion-${index}`}
                        value={rating}
                        checked={selectedEvaluation.ratings[index] === rating}
                        onChange={() => updateRating(index, rating)}
                        className="peer sr-only"
                      />
                      <span className="flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-ink peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-ink">
                        {rating}
                      </span>
                    </label>
                  ))}
                </div>
                {missingRating ? (
                  <p className="mt-3 text-sm text-danger">
                    Select a rating for this criterion.
                  </p>
                ) : null}
              </fieldset>
            );
          })}

          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <label
              htmlFor="remarks"
              className="text-base font-semibold text-ink"
            >
              Remarks for {selectedStudent.name}
            </label>
            <textarea
              id="remarks"
              name={`${selectedPhase}-${selectedStudent.id}-remarks`}
              rows={5}
              value={selectedEvaluation.remarks}
              onChange={(event) =>
                updateEvaluation({ remarks: event.target.value })
              }
              className={`mt-4 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 ${
                showErrors && !selectedEvaluation.remarks.trim()
                  ? "border-danger"
                  : "border-border"
              }`}
              placeholder="Add student-specific evaluation remarks"
            />
            {showErrors && !selectedEvaluation.remarks.trim() ? (
              <p className="mt-2 text-sm text-danger">Remarks are required.</p>
            ) : null}

            <label
              htmlFor="recommendation"
              className="mt-5 block text-base font-semibold text-ink"
            >
              Recommendation
            </label>
            <select
              id="recommendation"
              name={`${selectedPhase}-${selectedStudent.id}-recommendation`}
              value={selectedEvaluation.recommendation}
              onChange={(event) =>
                updateEvaluation({ recommendation: event.target.value })
              }
              className={`select-field mt-4 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 ${
                showErrors && !selectedEvaluation.recommendation
                  ? "border-danger"
                  : "border-border"
              }`}
            >
              <option value="" disabled>
                Select decision
              </option>
              <option>Approved</option>
              <option>Approved with changes</option>
              <option>Redo</option>
            </select>
            {showErrors && !selectedEvaluation.recommendation ? (
              <p className="mt-2 text-sm text-danger">
                Recommendation is required.
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
              >
                Save {selectedPhase} evaluation
              </button>
              {saved ? (
                <p className="text-sm font-semibold text-accent">
                  Evaluation saved.
                </p>
              ) : null}
            </div>
          </section>
        </section>
      </form>
    </div>
  );
}
