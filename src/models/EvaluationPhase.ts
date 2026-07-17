import {
  Schema,
  model,
  models,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";

type EvaluationPhase = {
  key: string;
  title: string;
  weightage: number;
  order: number;
  plos: Types.ObjectId[];
};

export type EvaluationPhaseDocument = HydratedDocument<EvaluationPhase>;

const EvaluationPhaseSchema = new Schema<EvaluationPhase>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    weightage: {
      type: Number,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      unique: true,
    },
    plos: {
      type: [Schema.Types.ObjectId],
      ref: "Plo",
      default: [],
    },
  },
  {
    collection: "evaluationphases",
    versionKey: false,
  },
);

export const EvaluationPhaseModel =
  (models.EvaluationPhase as Model<EvaluationPhase> | undefined) ??
  model<EvaluationPhase>("EvaluationPhase", EvaluationPhaseSchema);
