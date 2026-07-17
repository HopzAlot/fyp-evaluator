import { connectDatabase } from "@/lib/db/mongoose";
import {
  EvaluationPhaseModel,
  type EvaluationPhaseDocument,
} from "@/models/EvaluationPhase";
import { PloModel, type PloDocument } from "@/models/Plo";
import type {
  EvaluationPhase,
  EvaluationPlo,
} from "@/types/evaluation";

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
  phase: EvaluationPhaseDocument,
  plosByCode: Map<string, EvaluationPlo>,
): EvaluationPhase {
  const phasePlos = phase.plos
    .map((code) => plosByCode.get(code))
    .filter((plo): plo is EvaluationPlo => Boolean(plo));

  return {
    id: phase._id.toString(),
    key: phase.key,
    title: phase.title,
    weightage: phase.weightage,
    order: phase.order,
    plos: phasePlos,
  };
}

export async function getEvaluationPhasesWithPlos() {
  await connectDatabase();

  const [phases, plos] = await Promise.all([
    EvaluationPhaseModel.find().sort({ order: 1 }),
    PloModel.find().sort({ order: 1 }),
  ]);
  const plosByCode = new Map(plos.map((plo) => [plo.code, toEvaluationPlo(plo)]));

  return phases.map((phase) => toEvaluationPhase(phase, plosByCode));
}
