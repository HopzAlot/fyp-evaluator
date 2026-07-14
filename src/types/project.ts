export type ProjectStatus =
  | "pending"
  | "under-review"
  | "accepted"
  | "rejected";

export type ProjectBase = {
  title: string;
  students: string[];
  supervisor: string;
  coSupervisor: string;
  industrialPartner: string;
  sdg: string;
};

export type Project = ProjectBase & {
  id: string;
};

export type AdminProject = Project & {
  status: ProjectStatus;
};

export type FacultyProject = Project;

export type ProjectUpdateRequest = ProjectBase & {
  status: ProjectStatus;
};
