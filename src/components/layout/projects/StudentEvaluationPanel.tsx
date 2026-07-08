"use client";

import { useState } from "react";
import type { Student } from "@/data/projects";

type StudentEvaluationPanelProps = {
  students: Student[];
  criteria: string[];
};

const ratingOptions = ["Excellent", "Good", "Average", "Redo"];

export function StudentEvaluationPanel({
  students,
  criteria,
}: StudentEvaluationPanelProps) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id);
  const selectedStudent =
    students.find((student) => student.id === selectedStudentId) ?? students[0];

  return (
    <form className="grid gap-6 xl:grid-cols-[20rem_1fr]">
      <aside className="space-y-4">
        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Students</h2>
          <div className="mt-4 space-y-3">
            {students.map((student) => {
              const active = student.id === selectedStudent.id;

              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => setSelectedStudentId(student.id)}
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
                    {student.rollNo} - {student.progress}% done
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Selected student</h2>
          <p className="mt-3 text-sm font-semibold text-ink">
            {selectedStudent.name}
          </p>
          <p className="mt-1 text-sm text-muted">{selectedStudent.rollNo}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${selectedStudent.progress}%` }}
            />
          </div>
        </section>
      </aside>

      <section className="space-y-4">
        {criteria.map((criterion, index) => (
          <fieldset
            key={`${selectedStudent.id}-${criterion}`}
            className="rounded-lg border border-border bg-surface p-5 shadow-sm"
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
                    name={`${selectedStudent.id}-criterion-${index}`}
                    value={rating}
                    className="peer sr-only"
                  />
                  <span className="flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-ink peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-ink">
                    {rating}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <label htmlFor="remarks" className="text-base font-semibold text-ink">
            Remarks for {selectedStudent.name}
          </label>
          <textarea
            id="remarks"
            name={`${selectedStudent.id}-remarks`}
            rows={5}
            className="mt-4 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
            placeholder="Add student-specific evaluation remarks"
          />

          <label
            htmlFor="recommendation"
            className="mt-5 block text-base font-semibold text-ink"
          >
            Recommendation
          </label>
          <select
            id="recommendation"
            name={`${selectedStudent.id}-recommendation`}
            className="select-field mt-4 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            defaultValue=""
          >
            <option value="" disabled>
              Select decision
            </option>
            <option>Approved</option>
            <option>Approved with changes</option>
            <option>Redo</option>
          </select>

          <button
            type="button"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
          >
            Save student evaluation
          </button>
        </section>
      </section>
    </form>
  );
}
