import { isValidObjectId, Types } from "mongoose";
import { connectDatabase } from "@/lib/db/mongoose";
import { EvaluationModel, type EvaluationDocument } from "@/models/Evaluation";
import {
  EvaluationPhaseModel,
  type EvaluationPhaseDocument,
} from "@/models/EvaluationPhase";
import { PloModel, type PloDocument } from "@/models/Plo";
import { ProjectModel } from "@/models/Project";
import { UserModel } from "@/models/User";
import { syncProjectStatus } from "@/services/projectService";
import type {
  EvaluationPhase,
  EvaluationPhaseOption,
  EvaluationPlo,
  SavedPhaseEvaluation,
  SaveProjectEvaluationRequest,
} from "@/types/evaluation";

type PopulatedEvaluationPhase = Omit<EvaluationPhaseDocument, "plos"> & {
  plos: PloDocument[];
};

type EvaluationExportPhase = EvaluationPhase & {
  ploIds: Set<string>;
};

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatExportNumber(value: number | null) {
  if (value === null) {
    return "";
  }

  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(6).replace(/\.?0+$/, "");
}

function toEvaluationPlo(plo: PloDocument): EvaluationPlo {
  return {
    id: plo._id.toString(),
    code: plo.code,
    order: plo.order,
    title: plo.title,
    description: plo.description,
  };
}

function toEvaluationPhase(
  phase: PopulatedEvaluationPhase,
): EvaluationPhase {
  return {
    id: phase._id.toString(),
    key: phase.key,
    title: phase.title,
    weightage: phase.weightage,
    order: phase.order,
    plos: phase.plos.map(toEvaluationPlo),
  };
}

export async function getEvaluationPhasesWithPlos() {
  await connectDatabase();

  const phases = await EvaluationPhaseModel.find()
    .sort({ order: 1 })
    .populate<{ plos: PloDocument[] }>({
      path: "plos",
      options: { sort: { order: 1 } },
    });

  return (phases as unknown as PopulatedEvaluationPhase[]).map(
    toEvaluationPhase,
  );
}

export async function getEvaluationPhaseOptions(): Promise<
  EvaluationPhaseOption[]
> {
  await connectDatabase();

  const phases = await EvaluationPhaseModel.find()
    .sort({ order: 1 })
    .select("title");

  return phases.map((phase) => ({
    id: phase._id.toString(),
    title: phase.title,
  }));
}

export async function getSavedProjectEvaluations(
  projectId: string,
  facultyId: string,
): Promise<SavedPhaseEvaluation[]> {
  if (!isValidObjectId(projectId) || !isValidObjectId(facultyId)) {
    return [];
  }

  await connectDatabase();

  const evaluations = await EvaluationModel.find({
    projectId: new Types.ObjectId(projectId),
    facultyId: new Types.ObjectId(facultyId),
  }).sort({ submittedAt: 1 });

  return evaluations.map((evaluation) => ({
    id: evaluation._id.toString(),
    phaseId: evaluation.phaseId.toString(),
    submittedAt: evaluation.submittedAt.toISOString(),
    students: evaluation.students.map((student) => ({
      studentId: student.studentId || student.studentName,
      studentName: student.studentName,
      evaluations: student.evaluations.map((score) => ({
        ploId: score.ploId.toString(),
        obtainedMarks: score.obtainedMarks,
      })),
      totalMarks: student.totalMarks,
    })),
  }));
}

function isMark(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 5
  );
}

function normalizeStudentName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export async function savePhaseEvaluation(
  projectId: string,
  facultyId: string,
  payload: SaveProjectEvaluationRequest,
) {
  if (!isValidObjectId(projectId) || !isValidObjectId(facultyId)) {
    throw new Error("Invalid evaluation request");
  }

  if (!Array.isArray(payload.phases) || payload.phases.length === 0) {
    throw new Error("Evaluation phases are required");
  }

  if (payload.phases.length !== 1) {
    throw new Error("Only one phase can be saved at a time");
  }

  await connectDatabase();

  const phaseInput = payload.phases[0];

  if (!isValidObjectId(phaseInput.phaseId)) {
    throw new Error("Invalid phase selected");
  }

  const [phase, project, activeFaculty] = await Promise.all([
    EvaluationPhaseModel.findById(phaseInput.phaseId).populate<{
      plos: PloDocument[];
    }>({
      path: "plos",
      options: { sort: { order: 1 } },
    }),
    ProjectModel.findOne({
      _id: projectId,
      deletionPending: { $ne: true },
    }).select("students studentIds"),
    UserModel.exists({
      _id: facultyId,
      role: "faculty",
      status: "active",
    }),
  ]);

  if (!phase) {
    throw new Error("Evaluation phase not found");
  }

  if (!project) {
    throw new Error("Project not found");
  }

  if (!activeFaculty) {
    throw new Error("Your faculty account is not active");
  }

  if (!Array.isArray(phaseInput.students) || phaseInput.students.length !== 1) {
    throw new Error("Save one student evaluation at a time");
  }

  const populatedPhase = phase as unknown as PopulatedEvaluationPhase;
  const requiredPloIds = populatedPhase.plos.map((plo) => plo._id.toString());
  const studentInput = phaseInput.students[0];
  const studentId = studentInput.studentId.trim();
  const studentName = studentInput.studentName.trim();

  if (!studentId) {
    throw new Error("Student id is required");
  }

  if (!studentName) {
    throw new Error("Student name is required");
  }

  const projectStudentIndex = project.studentIds.indexOf(studentId);

  if (
    projectStudentIndex === -1 ||
    normalizeStudentName(project.students[projectStudentIndex]) !==
      normalizeStudentName(studentName)
  ) {
    throw new Error("Student does not belong to this project");
  }

  const scoresByPloId = new Map(
    studentInput.evaluations.map((score) => [
      score.ploId,
      score.obtainedMarks,
    ]),
  );

  if (
    studentInput.evaluations.length !== requiredPloIds.length ||
    scoresByPloId.size !== requiredPloIds.length ||
    requiredPloIds.some((ploId) => !scoresByPloId.has(ploId))
  ) {
    throw new Error("All PLO marks are required before saving");
  }

  const scores = requiredPloIds.map((ploId) => {
    const marks = scoresByPloId.get(ploId);

    if (!isMark(marks)) {
      throw new Error("PLO marks must be between 0 and 5");
    }

    return {
      ploId: new Types.ObjectId(ploId),
      obtainedMarks: marks,
    };
  });
  const student = {
    studentId,
    studentName: project.students[projectStudentIndex],
    evaluations: scores,
    totalMarks: scores.reduce(
      (total, score) => total + score.obtainedMarks,
      0,
    ),
  };
  const projectObjectId = new Types.ObjectId(projectId);
  const facultyObjectId = new Types.ObjectId(facultyId);
  const phaseObjectId = new Types.ObjectId(phaseInput.phaseId);
  const previousPhaseIds = (
    await EvaluationPhaseModel.find({ order: { $lt: populatedPhase.order } })
      .sort({ order: 1 })
      .select("_id")
  ).map((previousPhase) => previousPhase._id);

  if (previousPhaseIds.length > 0) {
    const completedPreviousPhases = await EvaluationModel.countDocuments({
      projectId: projectObjectId,
      facultyId: facultyObjectId,
      phaseId: { $in: previousPhaseIds },
      students: { $elemMatch: { studentId } },
    });

    if (completedPreviousPhases !== previousPhaseIds.length) {
      throw new Error("Complete the previous phases for this student first");
    }
  }

  const evaluationKey = {
    projectId: projectObjectId,
    facultyId: facultyObjectId,
    phaseId: phaseObjectId,
  };
  const submittedAt = new Date();
  let evaluation = await EvaluationModel.findOneAndUpdate(
    {
      ...evaluationKey,
      "students.studentId": { $ne: studentId },
    },
    {
      $push: { students: student },
      $set: { submittedAt },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!evaluation) {
    try {
      evaluation = await EvaluationModel.create({
        ...evaluationKey,
        students: [student],
        submittedAt,
      });
    } catch (error) {
      if (!isDuplicateKeyError(error)) {
        throw error;
      }

      evaluation = await EvaluationModel.findOneAndUpdate(
        {
          ...evaluationKey,
          "students.studentId": { $ne: studentId },
        },
        {
          $push: { students: student },
          $set: { submittedAt },
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      );

      if (!evaluation) {
        throw new Error("This student evaluation has already been saved");
      }
    }
  }

  await syncProjectStatus(projectId);

  return {
    evaluationId: evaluation._id.toString(),
  };
}

function getStudentFromEvaluation(
  evaluation: EvaluationDocument,
  studentId: string,
  studentName: string,
) {
  return evaluation.students.find(
    (student) =>
      (student.studentId
        ? student.studentId.trim().toLowerCase() === studentId.toLowerCase()
        : student.studentName.trim().toLowerCase() === studentName.toLowerCase()),
  );
}

export async function buildEvaluationResultsExportHtml(phaseIds?: string[]) {
  await connectDatabase();

  const [evaluatedProjectIds, phases, plos, totalFaculty] = await Promise.all([
    EvaluationModel.distinct("projectId"),
    EvaluationPhaseModel.find(
      phaseIds?.length ? { _id: { $in: phaseIds } } : {},
    )
      .sort({ order: 1 })
      .populate<{ plos: PloDocument[] }>({
        path: "plos",
        options: { sort: { order: 1 } },
      }),
    PloModel.find().sort({ order: 1 }),
    UserModel.countDocuments({ role: "faculty", status: "active" }),
  ]);
  const projects = await ProjectModel.find({
    _id: { $in: evaluatedProjectIds },
    deletionPending: { $ne: true },
  }).sort({ title: 1 });
  const exportPlos = plos.map(toEvaluationPlo);
  const exportPhases: EvaluationExportPhase[] = (
    phases as unknown as PopulatedEvaluationPhase[]
  ).map((phase) => {
    const mappedPhase = toEvaluationPhase(phase);

    return {
      ...mappedPhase,
      ploIds: new Set(mappedPhase.plos.map((plo) => plo.id)),
    };
  });
  const rows: string[] = [];

  for (const project of projects) {
    const projectEvaluations = await EvaluationModel.find({
      projectId: project._id,
    });
    const evaluatedStudentIds = new Set<string>();

    projectEvaluations.forEach((evaluation) => {
      evaluation.students.forEach((student) => {
        if (student.studentId) {
          evaluatedStudentIds.add(student.studentId);
        }
      });
    });

    const exportStudents = project.studentIds
      .map((studentId, index) => ({
        studentId,
        studentName: project.students[index],
      }))
      .filter((student) => evaluatedStudentIds.has(student.studentId))
      .sort((studentA, studentB) =>
        studentA.studentName.localeCompare(studentB.studentName),
      );

    if (exportStudents.length === 0) {
      continue;
    }

    rows.push(
      `<tr class="project"><td colspan="15">${escapeHtml(project.title)}</td></tr>`,
    );

    for (const { studentId, studentName } of exportStudents) {
      rows.push(
        `<tr class="student"><td>${escapeHtml(studentName)}</td>${exportPlos
          .map((plo) => `<td>${escapeHtml(plo.code)}</td>`)
          .join("")}<td>Marks</td><td>Faculty Evaluators (out of ${totalFaculty})</td></tr>`,
      );

      for (const phase of exportPhases) {
        const phaseEvaluations = projectEvaluations.filter(
          (evaluation) => evaluation.phaseId.toString() === phase.id,
        );
        const phaseCells = exportPlos
          .map((plo) => {
            if (!phase.ploIds.has(plo.id)) {
              return "<td></td>";
            }

            const ploAverage = average(
              phaseEvaluations.flatMap((evaluation) => {
                const student = getStudentFromEvaluation(
                  evaluation,
                  studentId,
                  studentName,
                );
                const score = student?.evaluations.find(
                  (studentScore) => studentScore.ploId.toString() === plo.id,
                );

                return score ? [score.obtainedMarks] : [];
              }),
            );

            return ploAverage === null
              ? "<td></td>"
              : `<td class="marked">${formatExportNumber(ploAverage)}</td>`;
          })
          .join("");
        const phaseWeightedScores = phaseEvaluations.flatMap((evaluation) => {
          const student = getStudentFromEvaluation(
            evaluation,
            studentId,
            studentName,
          );

          if (!student || phase.plos.length === 0) {
            return [];
          }

          const obtained = student.evaluations.reduce(
            (total, score) => total + score.obtainedMarks,
            0,
          );
          const maximum = phase.plos.length * 5;

          return [(obtained / maximum) * phase.weightage];
        });
        const facultyCount = new Set(
          phaseEvaluations.flatMap((evaluation) =>
            getStudentFromEvaluation(evaluation, studentId, studentName)
              ? [evaluation.facultyId.toString()]
              : [],
          ),
        ).size;

        rows.push(
          `<tr><td class="phase">${escapeHtml(`${phase.title} (${phase.weightage}%)`)}</td>${phaseCells}<td>${formatExportNumber(
            average(phaseWeightedScores),
          )}</td><td>${facultyCount || ""}</td></tr>`,
        );
      }

      rows.push('<tr class="spacer"><td colspan="15"></td></tr>');
    }
  }

  if (rows.length === 0) {
    rows.push('<tr><td colspan="15">No evaluation results found</td></tr>');
  }

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }
      td { border: 1px solid #111827; min-width: 72px; padding: 4px 6px; }
      .project td { background: #e5e7eb; font-size: 14px; font-weight: 700; }
      .student td { font-weight: 700; }
      .phase { font-weight: 700; min-width: 240px; }
      .marked { background: #082967; color: #ffffff; }
      .spacer td { border: 0; height: 18px; }
    </style>
  </head>
  <body>
    <table>${rows.join("")}</table>
  </body>
</html>`;
}
