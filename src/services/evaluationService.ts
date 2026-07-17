import { connectDatabase } from "@/lib/db/mongoose";
import {
  EvaluationPhaseModel,
  type EvaluationPhaseDocument,
} from "@/models/EvaluationPhase";
import "@/models/Plo";
import type { PloDocument } from "@/models/Plo";
import type {
  EvaluationPhase,
  EvaluationPlo,
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
