import { NextResponse } from "next/server";
import { cleanupOldDuplicateProjects } from "@/services/projectService";

export async function POST() {
  try {
    const result = await cleanupOldDuplicateProjects();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Old project duplicate cleanup error", error);
    return NextResponse.json(
      { message: "Unable to clean old duplicate projects right now" },
      { status: 500 },
    );
  }
}
