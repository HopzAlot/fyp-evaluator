import { NextResponse } from "next/server";
import { deleteProjectById } from "@/services/projectService";

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
      { message: "Unable to delete project right now" },
      { status: 500 },
    );
  }
}
