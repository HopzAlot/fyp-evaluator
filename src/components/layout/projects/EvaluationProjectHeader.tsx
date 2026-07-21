"use client";

import { ChevronDown, ChevronUp, Leaf } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type EvaluationProjectHeaderProps = {
  title: string;
  sdg: string;
  supervisor: string;
  coSupervisor: string;
  industrialPartner: string;
  students: string[];
};

export function EvaluationProjectHeader({
  title,
  sdg,
  supervisor,
  coSupervisor,
  industrialPartner,
  students,
}: EvaluationProjectHeaderProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="border-b border-border pb-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/projects"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Back to projects
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {title}
            </h1>
            <span
              title="Sustainable Development Goal"
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-accent/30 bg-accent-soft px-2.5 text-xs font-semibold text-accent"
            >
              <Leaf aria-hidden="true" className="h-3.5 w-3.5" />
              {sdg || "SDG not provided"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-label={expanded ? "Minimize project details" : "Show project details"}
          title={expanded ? "Minimize project details" : "Show project details"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-ink transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {expanded ? (
            <ChevronUp aria-hidden="true" className="h-5 w-5" />
          ) : (
            <ChevronDown aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </div>

      {expanded ? (
        <div className="mt-4">
          <p className="max-w-2xl text-sm leading-6 text-muted">
            Evaluate each student separately using the configured PLO criteria.
          </p>
          <dl className="mt-4 grid gap-x-6 gap-y-4 border-t border-border pt-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <dt className="text-xs font-semibold uppercase text-muted">
                Supervisor
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">{supervisor}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted">
                Co Supervisor
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {coSupervisor || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted">
                Industrial Partner
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {industrialPartner || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted">
                Students
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {students.join(", ") || "Not provided"}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
          <span>
            Supervisor: <strong className="font-semibold text-ink">{supervisor}</strong>
          </span>
          <span>
            <strong className="font-semibold text-ink">{students.length}</strong>{" "}
            members
          </span>
        </div>
      )}
    </section>
  );
}
