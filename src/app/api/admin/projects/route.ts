import { NextResponse } from "next/server";
import { deleteProjectsByIds } from "@/services/projectService";

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
      {
        message:
          "Selected projects are pending deletion while their evaluations are removed. Refresh to check their status.",
      },
      { status: 500 },
    );
  }
}
