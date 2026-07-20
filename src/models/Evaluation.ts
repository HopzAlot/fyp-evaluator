import {
  Schema,
  model,
  models,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";

type EvaluationScore = {
  ploId: Types.ObjectId;
  obtainedMarks: number;
};

type EvaluationStudent = {
  studentName: string;
  evaluations: EvaluationScore[];
  totalMarks: number;
};

type Evaluation = {
  projectId: Types.ObjectId;
  facultyId: Types.ObjectId;
  phaseId: Types.ObjectId;
  students: EvaluationStudent[];
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type EvaluationDocument = HydratedDocument<Evaluation>;

const EvaluationScoreSchema = new Schema<EvaluationScore>(
  {
    ploId: {
      type: Schema.Types.ObjectId,
      ref: "Plo",
      required: true,
    },
    obtainedMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
  },
  { _id: false },
);

const EvaluationStudentSchema = new Schema<EvaluationStudent>(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    evaluations: {
      type: [EvaluationScoreSchema],
      default: [],
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const EvaluationSchema = new Schema<Evaluation>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    facultyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phaseId: {
      type: Schema.Types.ObjectId,
      ref: "EvaluationPhase",
      required: true,
    },
    students: {
      type: [EvaluationStudentSchema],
      default: [],
    },
    submittedAt: {
      type: Date,
      required: true,
    },
  },
  {
    collection: "evaluations",
    timestamps: true,
    versionKey: false,
  },
);

EvaluationSchema.index(
  { projectId: 1, facultyId: 1, phaseId: 1 },
  { unique: true },
);

export const EvaluationModel =
  (models.Evaluation as Model<Evaluation> | undefined) ??
  model<Evaluation>("Evaluation", EvaluationSchema);
