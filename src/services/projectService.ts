import { isValidObjectId } from "mongoose";
import { connectDatabase } from "@/lib/db/mongoose";
import { ProjectModel, type ProjectDocument } from "@/models/Project";
import type {
  AdminProject,
  ProjectBase,
  ProjectUpdateRequest,
} from "@/types/project";

function normalizeProjectKeyPart(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function buildProjectKey(
  project: Pick<ProjectBase, "title" | "students" | "supervisor">,
) {
  const students = project.students
    .map(normalizeProjectKeyPart)
    .filter(Boolean)
    .sort()
    .join("|");

  return [
    normalizeProjectKeyPart(project.title),
    normalizeProjectKeyPart(project.supervisor),
    students,
  ].join("::");
}

async function backfillMissingProjectKeys() {
  const projectsWithKeys = await ProjectModel.find({
    projectKey: { $exists: true, $ne: "" },
  }).select("projectKey");
  const usedKeys = new Set(
    projectsWithKeys.map((project) => project.projectKey),
  );
  const projects = await ProjectModel.find({
    $or: [{ projectKey: { $exists: false } }, { projectKey: "" }],
  }).select("title students supervisor");

  await Promise.all(
    projects.map((project) => {
      const projectKey = buildProjectKey(project);

      if (usedKeys.has(projectKey)) {
        return Promise.resolve();
      }

      usedKeys.add(projectKey);

      return ProjectModel.updateOne(
        { _id: project._id },
        { $set: { projectKey } },
      );
    }),
  );
}

export async function cleanupOldDuplicateProjects() {
  await connectDatabase();

  const keyedProjects = await ProjectModel.find({
    projectKey: { $exists: true, $ne: "" },
  }).select("projectKey");
  const usedKeys = new Set(
    keyedProjects.map((project) => project.projectKey),
  );
  const oldProjects = await ProjectModel.find({
    $or: [{ projectKey: { $exists: false } }, { projectKey: "" }],
  })
    .select("title students supervisor")
    .sort({ createdAt: 1 });
  const duplicateIds: string[] = [];
  let backfilledCount = 0;

  await Promise.all(
    oldProjects.map((project) => {
      const projectKey = buildProjectKey(project);

      if (usedKeys.has(projectKey)) {
        duplicateIds.push(project._id.toString());
        return Promise.resolve();
      }

      usedKeys.add(projectKey);
      backfilledCount += 1;

      return ProjectModel.updateOne(
        { _id: project._id },
        { $set: { projectKey } },
      );
    }),
  );

  if (duplicateIds.length === 0) {
    return {
      backfilledCount,
      deletedCount: 0,
      deletedIds: [],
    };
  }

  const result = await ProjectModel.deleteMany({ _id: { $in: duplicateIds } });

  return {
    backfilledCount,
    deletedCount: result.deletedCount,
    deletedIds: duplicateIds,
  };
}

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
  await backfillMissingProjectKeys();

  const projects = await ProjectModel.find().sort({ createdAt: -1 });

  return projects.map(toAdminProject);
}

export async function createProjectsFromCsvRows(rows: ProjectBase[]) {
  await connectDatabase();
  await backfillMissingProjectKeys();

  const projectRows = rows.map((row) => ({
    ...row,
    projectKey: buildProjectKey(row),
  }));
  const uniqueRows = Array.from(
    new Map(projectRows.map((row) => [row.projectKey, row])).values(),
  );
  const existingProjects = await ProjectModel.find().select(
    "projectKey title students supervisor",
  );
  const existingKeys = new Set(
    existingProjects.map((project) =>
      project.projectKey || buildProjectKey(project),
    ),
  );
  const rowsToInsert = uniqueRows.filter(
    (row) => !existingKeys.has(row.projectKey),
  );
  const skippedCount = rows.length - rowsToInsert.length;

  if (rowsToInsert.length === 0) {
    return {
      projects: [],
      skippedCount,
    };
  }

  const projects = await ProjectModel.insertMany(
    rowsToInsert.map((row) => ({
      ...row,
      status: "pending",
    })),
    { ordered: false },
  );

  return {
    projects: projects.map(toAdminProject),
    skippedCount,
  };
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
  await backfillMissingProjectKeys();

  const projectKey = buildProjectKey(values);
  const existingProjects = await ProjectModel.find({
    _id: { $ne: projectId },
  }).select("projectKey title students supervisor");
  const duplicateProject = existingProjects.some(
    (project) => (project.projectKey || buildProjectKey(project)) === projectKey,
  );

  if (duplicateProject) {
    throw new Error(
      "A project with the same title, supervisor, and students already exists",
    );
  }

  const project = await ProjectModel.findByIdAndUpdate(
    projectId,
    {
      ...values,
      projectKey,
    },
    {
      new: true,
      runValidators: true,
    },
  );

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
