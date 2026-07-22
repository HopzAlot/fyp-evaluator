export type EvaluationPlo = {
  id: string;
  code: string;
  order: number;
  title: string;
  description: string;
};

export type EvaluationPhase = {
  id: string;
  key: string;
  title: string;
  weightage: number;
  order: number;
  plos: EvaluationPlo[];
};

export type EvaluationPhaseOption = Pick<
  EvaluationPhase,
  "id" | "title"
>;

export type EvaluationScoreInput = {
  ploId: string;
  obtainedMarks: number;
};

export type EvaluationStudentInput = {
  studentId: string;
  studentName: string;
  evaluations: EvaluationScoreInput[];
  totalMarks: number;
};

export type EvaluationPhaseSubmission = {
  phaseId: string;
  students: EvaluationStudentInput[];
};

export type SaveProjectEvaluationRequest = {
  phases: EvaluationPhaseSubmission[];
};

export type SavedPhaseEvaluation = EvaluationPhaseSubmission & {
  id: string;
  submittedAt: string;
};
