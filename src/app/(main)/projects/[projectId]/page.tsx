import { notFound } from "next/navigation";
import { EvaluationProjectHeader } from "@/components/layout/projects/EvaluationProjectHeader";
import { StudentEvaluationPanel } from "@/components/layout/projects/StudentEvaluationPanel";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/auth/jwt";
import { getAuthTokens } from "@/lib/auth/session";
import {
  getEvaluationPhasesWithPlos,
  getSavedProjectEvaluations,
} from "@/services/evaluationService";
import { getFacultyProjectById } from "@/services/projectService";

type EvaluationPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

async function getCurrentFacultyId() {
  const { accessToken, refreshToken } = await getAuthTokens();
  const payload =
    (accessToken ? verifyAccessToken(accessToken) : null) ??
    (refreshToken ? verifyRefreshToken(refreshToken) : null);

  return payload?.role === "faculty" ? payload.userId : "";
}

export default async function EvaluationPage({ params }: EvaluationPageProps) {
  const { projectId } = await params;
  const [project, phases, facultyId] = await Promise.all([
    getFacultyProjectById(projectId),
    getEvaluationPhasesWithPlos(),
    getCurrentFacultyId(),
  ]);

  if (!project) {
    notFound();
  }

  const savedEvaluations = facultyId
    ? await getSavedProjectEvaluations(project.id, facultyId)
    : [];
  const students = project.students.map((studentName, index) => ({
    id: project.studentIds[index],
    name: studentName,
  }));
  const initialPhase = phases[0];

  return (
    <div className="space-y-6">
      <EvaluationProjectHeader
        title={project.title}
        sdg={project.sdg}
        supervisor={project.supervisor}
        coSupervisor={project.coSupervisor}
        industrialPartner={project.industrialPartner}
        students={project.students}
      />

      {students.length > 0 && initialPhase ? (
        <StudentEvaluationPanel
          projectId={project.id}
          students={students}
          phases={phases}
          initialPhaseKey={initialPhase.key}
          savedEvaluations={savedEvaluations}
        />
      ) : null}

      {students.length > 0 && !initialPhase ? (
        <section className="rounded-lg border border-border bg-surface p-5 text-sm text-muted shadow-sm">
          No evaluation phases found.
        </section>
      ) : null}

      {students.length === 0 ? (
        <section className="rounded-lg border border-border bg-surface p-5 text-sm text-muted shadow-sm">
          No students found for this project.
        </section>
      ) : null}
    </div>
  );
}
