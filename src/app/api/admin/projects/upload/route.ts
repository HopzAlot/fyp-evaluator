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
    const projects = await createProjectsFromCsvRows(rows);

    return NextResponse.json({ projects }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload projects";

    return NextResponse.json({ message }, { status: 400 });
  }
}
