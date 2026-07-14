import { NextResponse } from "next/server";
import { getFacultyProjects } from "@/services/projectService";

export async function GET() {
  try {
    const projects = await getFacultyProjects();

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Faculty projects list error", error);
    return NextResponse.json(
      { message: "Unable to load projects right now" },
      { status: 500 },
    );
  }
}
