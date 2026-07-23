import { readFile } from "node:fs/promises";
import mongoose, { Types } from "mongoose";

const env = await readFile(".env", "utf8");

env.split(/\r?\n/).forEach((line) => {
  const separator = line.indexOf("=");

  if (separator < 1) {
    return;
  }

  const key = line.slice(0, separator).trim();
  const value = line
    .slice(separator + 1)
    .trim()
    .replace(/^(['"])(.*)\1$/, "$2");

  process.env[key] ??= value;
});

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not configured");
}

await mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.MONGODB_DB ?? "fyp_evaluator",
});

const projects = mongoose.connection.collection("projects");
const evaluations = mongoose.connection.collection("evaluations");
const projectDocuments = await projects.find().toArray();
let migratedProjects = 0;
let migratedStudents = 0;

for (const project of projectDocuments) {
  const students = Array.isArray(project.students) ? project.students : [];
  const hasStableIds =
    Array.isArray(project.studentIds) &&
    project.studentIds.length === students.length &&
    project.studentIds.every((studentId) => typeof studentId === "string" && studentId);
  const studentIds = hasStableIds
    ? project.studentIds
    : students.map(() => new Types.ObjectId().toString());

  if (!hasStableIds) {
    await projects.updateOne(
      { _id: project._id },
      { $set: { studentIds } },
    );
    migratedProjects += 1;
  }

  const projectEvaluations = await evaluations
    .find({ projectId: project._id })
    .toArray();

  for (const evaluation of projectEvaluations) {
    let changed = false;
    const evaluationStudents = (evaluation.students ?? []).map((student) => {
      const studentIndex = students.findIndex(
        (name) =>
          name.trim().toLowerCase() ===
          String(student.studentName ?? "").trim().toLowerCase(),
      );

      if (studentIndex < 0 || student.studentId === studentIds[studentIndex]) {
        return student;
      }

      changed = true;
      migratedStudents += 1;
      return { ...student, studentId: studentIds[studentIndex] };
    });

    if (changed) {
      await evaluations.updateOne(
        { _id: evaluation._id },
        { $set: { students: evaluationStudents } },
      );
    }
  }
}

await mongoose.disconnect();
console.log(
  `Migrated ${migratedProjects} projects and ${migratedStudents} saved student evaluations.`,
);
