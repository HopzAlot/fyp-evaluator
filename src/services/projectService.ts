import { isValidObjectId } from "mongoose";
import { connectDatabase } from "@/lib/db/mongoose";
import { ProjectModel, type ProjectDocument } from "@/models/Project";
import type {
  AdminProject,
  ProjectCsvRow,
  ProjectUpdateRequest,
} from "@/types/project";

export function toAdminProject(project: ProjectDocument): AdminProject {
  return {
    id: project._id.toString(),
    title: project.title,
    students: project.students,
    supervisor: project.supervisor,
    coSupervisor: project.coSupervisor,
    industrialPartner: project.industrialPartner,
    sdg: project.sdg,
    status: project.status,
  };
}

export async function getAdminProjects() {
  await connectDatabase();
  const projects = await ProjectModel.find().sort({ createdAt: -1 });

  return projects.map(toAdminProject);
}

export async function createProjectsFromCsvRows(rows: ProjectCsvRow[]) {
  await connectDatabase();

  const projects = await ProjectModel.insertMany(
    rows.map((row) => ({
      ...row,
      status: "pending",
    })),
    { ordered: false },
  );

  return projects.map(toAdminProject);
}

export async function deleteProjectById(projectId: string) {
  if (!isValidObjectId(projectId)) {
    return 0;
  }

  await connectDatabase();
  const result = await ProjectModel.deleteOne({ _id: projectId });

  return result.deletedCount;
}

export async function updateProjectById(
  projectId: string,
  values: ProjectUpdateRequest,
) {
  if (!isValidObjectId(projectId)) {
    return null;
  }

  await connectDatabase();
  const project = await ProjectModel.findByIdAndUpdate(projectId, values, {
    new: true,
    runValidators: true,
  });

  return project ? toAdminProject(project) : null;
}

export async function deleteProjectsByIds(projectIds: string[]) {
  const validIds = projectIds.filter((projectId) => isValidObjectId(projectId));

  if (validIds.length === 0) {
    return 0;
  }

  await connectDatabase();
  const result = await ProjectModel.deleteMany({ _id: { $in: validIds } });

  return result.deletedCount;
}
