import Link from "next/link";
import { notFound } from "next/navigation";
import { StudentEvaluationPanel } from "@/components/layout/projects/StudentEvaluationPanel";
import { evaluationCriteria, evaluationPhases } from "@/constants/evaluation";
import { getFacultyProjectById } from "@/services/projectService";

const initialPhase = "Synopsis";

type EvaluationPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function EvaluationPage({ params }: EvaluationPageProps) {
  const { projectId } = await params;
  const project = await getFacultyProjectById(projectId);

  if (!project) {
    notFound();
  }

  const students = project.students;

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
          <p className="font-semibold text-ink">{initialPhase} evaluation</p>
          <p className="mt-1 text-muted">{students.length} members</p>
        </div>
      </section>

      {students.length > 0 ? (
        <StudentEvaluationPanel
          students={students}
          criteria={evaluationCriteria}
          phases={evaluationPhases}
          initialPhase={initialPhase}
        />
      ) : null}

      {students.length === 0 ? (
        <section className="rounded-lg border border-border bg-surface p-5 text-sm text-muted shadow-sm">
          No students found for this project.
        </section>
      ) : null}
    </div>
  );
}
