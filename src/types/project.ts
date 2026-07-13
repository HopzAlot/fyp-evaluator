export type AdminProjectStatus =
  | "pending"
  | "under-review"
  | "accepted"
  | "rejected";

export type AdminProject = {
  id: string;
  title: string;
  students: string[];
  supervisor: string;
  coSupervisor: string;
  industrialPartner: string;
  sdg: string;
  status: AdminProjectStatus;
};

export type ProjectCsvRow = {
  title: string;
  students: string[];
  supervisor: string;
  coSupervisor: string;
  industrialPartner: string;
  sdg: string;
};

export type ProjectUpdateRequest = ProjectCsvRow & {
  status: AdminProjectStatus;
};
