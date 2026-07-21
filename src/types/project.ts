export type ProjectStatus = "in progress" | "completed";

export type ProjectEvaluationProgress = {
  percentage: number;
  completedPhases: number;
  totalPhases: number;
  currentPhase: string | null;
};

export type ProjectInput = {
  title: string;
  students: string[];
  supervisor: string;
  coSupervisor: string;
  industrialPartner: string;
  sdg: string;
};

export type Project = ProjectInput & {
  id: string;
  status: ProjectStatus;
  evaluationProgress?: ProjectEvaluationProgress;
};
