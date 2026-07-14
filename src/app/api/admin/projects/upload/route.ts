import { NextResponse } from "next/server";
import { createProjectsFromCsvRows } from "@/services/projectService";
import { parseProjectCsv } from "@/utils/csv/projectCsv";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Upload a CSV file" },
        { status: 400 },
      );
    }

    const rows = parseProjectCsv(await file.text());
    const { projects, skippedCount } = await createProjectsFromCsvRows(rows);

    return NextResponse.json({ projects, skippedCount }, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: "Duplicate projects were found in this upload" },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Unable to upload projects";

    return NextResponse.json({ message }, { status: 400 });
  }
}
