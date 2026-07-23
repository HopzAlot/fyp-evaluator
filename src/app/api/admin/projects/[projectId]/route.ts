import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import {
  deleteProjectById,
  updateProjectById,
} from "@/services/projectService";
import type { ProjectUpdateInput } from "@/types/project";
import { normalizeText } from "@/utils/normalization/facultyNormalization";

function validateProjectPayload(payload: unknown): ProjectUpdateInput {
  const values = payload as Partial<ProjectUpdateInput>;
  const title = normalizeText(values.title ?? "");
  const rawStudents = Array.isArray(values.students)
    ? values.students.slice(0, 4)
    : [];
  const rawStudentIds = Array.isArray(values.studentIds)
    ? values.studentIds.slice(0, 4)
    : [];
  const studentRows = rawStudents
    .map((student, index) => ({
      name: normalizeText(student ?? ""),
      id: normalizeText(rawStudentIds[index] ?? ""),
    }))
    .filter((student) => student.name);
  const students = studentRows.map((student) => student.name);
  const studentIds = studentRows.map((student) => student.id);
  const supervisor = normalizeText(values.supervisor ?? "");
  const coSupervisor = normalizeText(values.coSupervisor ?? "");
  const industrialPartner = normalizeText(values.industrialPartner ?? "");
  const sdg = normalizeText(values.sdg ?? "");

  if (!title) {
    throw new Error("Title is required");
  }

  if (students.length === 0) {
    throw new Error("At least one student is required");
  }

  if (!Array.isArray(values.studentIds)) {
    throw new Error("Student identity data is required");
  }

  if (studentIds.some((studentId) => studentId && !isValidObjectId(studentId))) {
    throw new Error("Invalid student identity data");
  }

  const existingStudentIds = studentIds.filter(Boolean);

  if (new Set(existingStudentIds).size !== existingStudentIds.length) {
    throw new Error("A student cannot appear more than once");
  }

  if (!supervisor) {
    throw new Error("Supervisor is required");
  }

  if (!industrialPartner) {
    throw new Error("Industrial partner is required");
  }

  if (!sdg) {
    throw new Error("SDG is required");
  }

  return {
    title,
    students,
    studentIds,
    supervisor,
    coSupervisor,
    industrialPartner,
    sdg,
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const values = validateProjectPayload(await request.json());
    const project = await updateProjectById(projectId, values);

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: "A project with the same title, supervisor, and students already exists" },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Unable to update project";

    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const deletedCount = await deleteProjectById(projectId);

    if (!deletedCount) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ deletedCount });
  } catch (error) {
    console.error("Admin project delete error", error);
    return NextResponse.json(
      {
        message:
          "Project deletion is pending while its evaluations are removed. Refresh to check its status, then retry if it remains.",
      },
      { status: 500 },
    );
  }
}
