import { isValidObjectId, type Types } from "mongoose";
import { connectDatabase } from "@/lib/db/mongoose";
import { EvaluationModel, type EvaluationDocument } from "@/models/Evaluation";
import { EvaluationPhaseModel } from "@/models/EvaluationPhase";
import { ProjectModel, type ProjectDocument } from "@/models/Project";
import type {
  Project,
  ProjectEvaluationProgress,
  ProjectInput,
  ProjectStatus,
} from "@/types/project";

type EvaluationPhaseSummary = {
  id: string;
  title: string;
};

type EvaluatedStudentPhase = {
  _id: {
    projectId: Types.ObjectId;
    phaseId: Types.ObjectId;
    studentId: string;
    studentName: string;
  };
};

function normalizeProjectKeyPart(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function buildProjectKey(
  project: Pick<ProjectInput, "title" | "students" | "supervisor">,
) {
  const students = project.students
    .map(normalizeProjectKeyPart)
    .filter(Boolean)
    .sort()
    .join("|");

  return [
    normalizeProjectKeyPart(project.title),
    normalizeProjectKeyPart(project.supervisor),
    students,
  ].join("::");
}

async function backfillMissingProjectKeys() {
  const projectsWithKeys = await ProjectModel.find({
    projectKey: { $exists: true, $ne: "" },
  }).select("projectKey");
  const usedKeys = new Set(
    projectsWithKeys.map((project) => project.projectKey),
  );
  const projects = await ProjectModel.find({
    $or: [{ projectKey: { $exists: false } }, { projectKey: "" }],
  }).select("title students supervisor");

  await Promise.all(
    projects.map((project) => {
      const projectKey = buildProjectKey(project);

      if (usedKeys.has(projectKey)) {
        return Promise.resolve();
      }

      usedKeys.add(projectKey);

      return ProjectModel.updateOne(
        { _id: project._id },
        { $set: { projectKey } },
      );
    }),
  );
}

function getEvaluatedStudentsByPhase(evaluations: EvaluationDocument[]) {
  const evaluatedStudentsByPhase = new Map<string, Set<string>>();

  evaluations.forEach((evaluation) => {
    const studentKeys = evaluatedStudentsByPhase.get(
      evaluation.phaseId.toString(),
    ) ?? new Set<string>();

    evaluation.students.forEach((student) => {
      studentKeys.add(student.studentId.trim().toLowerCase());
      studentKeys.add(student.studentName.trim().toLowerCase());
    });
    evaluatedStudentsByPhase.set(evaluation.phaseId.toString(), studentKeys);
  });

  return evaluatedStudentsByPhase;
}

function getProjectEvaluationProgress(
  project: ProjectDocument,
  phases: EvaluationPhaseSummary[],
  evaluatedStudentsByPhase: Map<string, Set<string>>,
): ProjectEvaluationProgress {
  const totalStudentPhases = project.students.length * phases.length;

  if (totalStudentPhases === 0) {
    return {
      percentage: 0,
      completedPhases: 0,
      totalPhases: phases.length,
      currentPhase: null,
    };
  }

  let completedStudentPhases = 0;
  let completedPhases = 0;
  let currentPhase: string | null = null;

  phases.forEach((phase) => {
    const evaluatedStudents = evaluatedStudentsByPhase.get(phase.id);
    const completedStudents = project.students.filter((studentName, index) =>
      evaluatedStudents?.has(`${project._id.toString()}-${index + 1}`) ||
      evaluatedStudents?.has(studentName.trim().toLowerCase()),
    ).length;

    completedStudentPhases += completedStudents;

    if (completedStudents === project.students.length) {
      completedPhases += 1;
    } else if (!currentPhase) {
      currentPhase = phase.title;
    }
  });

  return {
    percentage: Math.round(
      (completedStudentPhases / totalStudentPhases) * 100,
    ),
    completedPhases,
    totalPhases: phases.length,
    currentPhase,
  };
}

export async function syncProjectStatus(projectId: string) {
  if (!isValidObjectId(projectId)) {
    return null;
  }

  await connectDatabase();

  const [project, phases, evaluations] = await Promise.all([
    ProjectModel.findById(projectId),
    EvaluationPhaseModel.find().sort({ order: 1 }).select("title"),
    EvaluationModel.find({ projectId }).select(
      "projectId phaseId students.studentId students.studentName",
    ),
  ]);

  if (!project) {
    return null;
  }

  const progress = getProjectEvaluationProgress(
    project,
    phases.map((phase) => ({
      id: phase._id.toString(),
      title: phase.title,
    })),
    getEvaluatedStudentsByPhase(evaluations),
  );
  const status: ProjectStatus =
    progress.totalPhases > 0 &&
    progress.completedPhases === progress.totalPhases
      ? "completed"
      : "in progress";

  if (project.status !== status) {
    await ProjectModel.updateOne({ _id: project._id }, { $set: { status } });
  }

  return status;
}

export function toProject(project: ProjectDocument): Project {
  return {
    id: project._id.toString(),
    title: project.title,
    students: project.students,
    supervisor: project.supervisor,
    coSupervisor: project.coSupervisor,
    industrialPartner: project.industrialPartner,
    sdg: project.sdg,
    status: project.status === "completed" ? "completed" : "in progress",
  };
}

export async function getAdminProjects() {
  await connectDatabase();
  await backfillMissingProjectKeys();

  const [projects, phases, evaluatedStudentPhases] = await Promise.all([
    ProjectModel.find().sort({ createdAt: -1 }),
    EvaluationPhaseModel.find().sort({ order: 1 }).select("title"),
    EvaluationModel.aggregate<EvaluatedStudentPhase>([
      { $unwind: "$students" },
      {
        $group: {
          _id: {
            projectId: "$projectId",
            phaseId: "$phaseId",
            studentId: "$students.studentId",
            studentName: "$students.studentName",
          },
        },
      },
    ]),
  ]);
  const phaseSummaries = phases.map((phase) => ({
    id: phase._id.toString(),
    title: phase.title,
  }));
  const evaluatedStudentsByProject = new Map<
    string,
    Map<string, Set<string>>
  >();

  evaluatedStudentPhases.forEach(({ _id }) => {
    const projectId = _id.projectId.toString();
    const phaseId = _id.phaseId.toString();
    const projectPhases =
      evaluatedStudentsByProject.get(projectId) ??
      new Map<string, Set<string>>();
    const studentKeys = projectPhases.get(phaseId) ?? new Set<string>();

    studentKeys.add((_id.studentId ?? "").trim().toLowerCase());
    studentKeys.add((_id.studentName ?? "").trim().toLowerCase());
    projectPhases.set(phaseId, studentKeys);
    evaluatedStudentsByProject.set(projectId, projectPhases);
  });

  return projects.map((project) => ({
    ...toProject(project),
    evaluationProgress: getProjectEvaluationProgress(
      project,
      phaseSummaries,
      evaluatedStudentsByProject.get(project._id.toString()) ?? new Map(),
    ),
  }));
}

export async function getFacultyProjects() {
  await connectDatabase();

  const projects = await ProjectModel.find().sort({ createdAt: -1 });

  return projects.map(toProject);
}

export async function getFacultyProjectById(projectId: string) {
  if (!isValidObjectId(projectId)) {
    return null;
  }

  await connectDatabase();

  const project = await ProjectModel.findById(projectId);

  return project ? toProject(project) : null;
}

export async function getFacultyDashboardSummary() {
  const projects = await getFacultyProjects();

  return {
    totalProjects: projects.length,
    totalStudents: projects.reduce(
      (count, project) => count + project.students.length,
      0,
    ),
    industryProjects: projects.filter((project) => project.industrialPartner)
      .length,
    recentProjects: projects.slice(0, 3),
  };
}

export async function createProjectsFromCsvRows(rows: ProjectInput[]) {
  await connectDatabase();
  await backfillMissingProjectKeys();

  const projectRows = rows.map((row) => ({
    ...row,
    projectKey: buildProjectKey(row),
  }));
  const uniqueRows = Array.from(
    new Map(projectRows.map((row) => [row.projectKey, row])).values(),
  );
  const existingProjects = await ProjectModel.find().select(
    "projectKey title students supervisor",
  );
  const existingKeys = new Set(
    existingProjects.map((project) =>
      project.projectKey || buildProjectKey(project),
    ),
  );
  const rowsToInsert = uniqueRows.filter(
    (row) => !existingKeys.has(row.projectKey),
  );
  const skippedCount = rows.length - rowsToInsert.length;

  if (rowsToInsert.length === 0) {
    return {
      projects: [],
      skippedCount,
    };
  }

  const [projects, phases] = await Promise.all([
    ProjectModel.insertMany(rowsToInsert, { ordered: false }),
    EvaluationPhaseModel.find().sort({ order: 1 }).select("title"),
  ]);
  const phaseSummaries = phases.map((phase) => ({
    id: phase._id.toString(),
    title: phase.title,
  }));

  return {
    projects: projects.map((project) => ({
      ...toProject(project),
      evaluationProgress: getProjectEvaluationProgress(
        project,
        phaseSummaries,
        new Map(),
      ),
    })),
    skippedCount,
  };
}

export async function deleteProjectById(projectId: string) {
  if (!isValidObjectId(projectId)) {
    return 0;
  }

  await connectDatabase();
  const result = await ProjectModel.deleteOne({ _id: projectId });

  return result.deletedCount;
}

export async function updateProjectById(
  projectId: string,
  values: ProjectInput,
) {
  if (!isValidObjectId(projectId)) {
    return null;
  }

  await connectDatabase();
  await backfillMissingProjectKeys();

  const projectKey = buildProjectKey(values);
  const existingProjects = await ProjectModel.find({
    _id: { $ne: projectId },
  }).select("projectKey title students supervisor");
  const duplicateProject = existingProjects.some(
    (project) => (project.projectKey || buildProjectKey(project)) === projectKey,
  );

  if (duplicateProject) {
    throw new Error(
      "A project with the same title, supervisor, and students already exists",
    );
  }

  const project = await ProjectModel.findByIdAndUpdate(
    projectId,
    {
      ...values,
      projectKey,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (project) {
    project.status = (await syncProjectStatus(projectId)) ?? project.status;
  }

  return project ? toProject(project) : null;
}

export async function deleteProjectsByIds(projectIds: string[]) {
  const validIds = projectIds.filter((projectId) => isValidObjectId(projectId));

  if (validIds.length === 0) {
    return 0;
  }

  await connectDatabase();
  const result = await ProjectModel.deleteMany({ _id: { $in: validIds } });

  return result.deletedCount;
}
