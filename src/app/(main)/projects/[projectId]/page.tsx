import Link from "next/link";
import { notFound } from "next/navigation";
import { StudentEvaluationPanel } from "@/components/layout/projects/StudentEvaluationPanel";
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
            Evaluate each student separately using rubric criteria, remarks,
            and final recommendation.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 text-sm shadow-sm">
          <p className="font-semibold text-ink">{project.phase} evaluation</p>
          <p className="mt-1 text-muted">{project.members.length} members</p>
        </div>
      </section>

      <StudentEvaluationPanel
        students={project.members}
        criteria={evaluationCriteria}
        phases={evaluationPhases}
        initialPhase={project.phase}
      />
    </div>
  );
}
