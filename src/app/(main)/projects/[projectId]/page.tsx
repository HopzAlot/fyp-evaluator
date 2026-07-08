import Link from "next/link";
import { notFound } from "next/navigation";
import {
  evaluationCriteria,
  evaluationPhases,
  projects,
} from "@/data/projects";

type EvaluationPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

const ratingOptions = ["Excellent", "Good", "Average", "Redo"];

export default async function EvaluationPage({ params }: EvaluationPageProps) {
  const { projectId } = await params;
  const project = projects.find((item) => item.id === projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-start">
        <div>
          <Link
            href="/projects"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Back to projects
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
            {project.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Evaluate the current project phase using rubric criteria, remarks,
            and final recommendation.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 text-sm shadow-sm">
          <p className="font-semibold text-ink">{project.phase} evaluation</p>
          <p className="mt-1 text-muted">{project.members.length} members</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {evaluationPhases.map((phase) => {
          const active = phase === project.phase;

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

      <form className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <section className="space-y-4">
          {evaluationCriteria.map((criterion, index) => (
            <fieldset
              key={criterion}
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
                  <label
                    key={rating}
                    className="cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`criterion-${index}`}
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
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">Project group</h2>
            <div className="mt-4 space-y-3">
              {project.members.map((member) => (
                <div
                  key={member}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-ink"
                >
                  {member}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <label
              htmlFor="remarks"
              className="text-base font-semibold text-ink"
            >
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              rows={6}
              className="mt-4 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="Add evaluation remarks"
            />

            <label
              htmlFor="recommendation"
              className="mt-5 block text-base font-semibold text-ink"
            >
              Recommendation
            </label>
            <select
              id="recommendation"
              name="recommendation"
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
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
            >
              Save evaluation
            </button>
          </section>
        </aside>
      </form>
    </div>
  );
}
