import { isValidObjectId, Types } from "mongoose";
import { connectDatabase } from "@/lib/db/mongoose";
import { EvaluationModel } from "@/models/Evaluation";
import {
  EvaluationPhaseModel,
  type EvaluationPhaseDocument,
} from "@/models/EvaluationPhase";
import "@/models/Plo";
import type { PloDocument } from "@/models/Plo";
import type {
  EvaluationPhase,
  EvaluationPlo,
  SavedPhaseEvaluation,
  SaveProjectEvaluationRequest,
} from "@/types/evaluation";

type PopulatedEvaluationPhase = Omit<EvaluationPhaseDocument, "plos"> & {
  plos: PloDocument[];
};

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

  const phase = await EvaluationPhaseModel.findById(phaseInput.phaseId)
    .populate<{ plos: PloDocument[] }>({
      path: "plos",
      options: { sort: { order: 1 } },
    });

  if (!phase) {
    throw new Error("Evaluation phase not found");
  }

  if (!Array.isArray(phaseInput.students) || phaseInput.students.length === 0) {
    throw new Error("Student evaluations are required");
  }

  const populatedPhase = phase as unknown as PopulatedEvaluationPhase;
  const requiredPloIds = populatedPhase.plos.map((plo) => plo._id.toString());
  const students = phaseInput.students.map((student) => {
    const studentName = student.studentName.trim();

    if (!studentName) {
      throw new Error("Student name is required");
    }

    const scoresByPloId = new Map(
      student.evaluations.map((score) => [score.ploId, score.obtainedMarks]),
    );
    const missingScore = requiredPloIds.some(
      (ploId) => !scoresByPloId.has(ploId),
    );

    if (missingScore) {
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

    return {
      studentName,
      evaluations: scores,
      totalMarks: scores.reduce(
        (total, score) => total + score.obtainedMarks,
        0,
      ),
    };
  });
  const projectObjectId = new Types.ObjectId(projectId);
  const facultyObjectId = new Types.ObjectId(facultyId);
  const phaseObjectId = new Types.ObjectId(phaseInput.phaseId);
  const evaluation = await EvaluationModel.findOneAndUpdate(
    {
      projectId: projectObjectId,
      facultyId: facultyObjectId,
      phaseId: phaseObjectId,
    },
    {
      $set: {
        projectId: projectObjectId,
        facultyId: facultyObjectId,
        phaseId: phaseObjectId,
        students,
        submittedAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  );

  return {
    evaluationId: evaluation._id.toString(),
  };
}
