import { NextResponse } from "next/server";
import {
  deleteProjectsByIds,
  getAdminProjects,
} from "@/services/projectService";

export async function GET() {
  try {
    const projects = await getAdminProjects();

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Admin projects list error", error);
    return NextResponse.json(
      { message: "Unable to load projects right now" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { ids?: string[] };

    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { message: "Select at least one project" },
        { status: 400 },
      );
    }

    const deletedCount = await deleteProjectsByIds(body.ids);

    return NextResponse.json({ deletedCount });
  } catch (error) {
    console.error("Admin projects bulk delete error", error);
    return NextResponse.json(
      { message: "Unable to delete selected projects right now" },
      { status: 500 },
    );
  }
}
