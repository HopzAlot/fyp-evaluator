import { NextResponse } from "next/server";
import { getFacultyProjectById } from "@/services/projectService";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const project = await getFacultyProjectById(projectId);

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Faculty project detail error", error);
    return NextResponse.json(
      { message: "Unable to load project right now" },
      { status: 500 },
    );
  }
}
