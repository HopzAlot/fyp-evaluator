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
