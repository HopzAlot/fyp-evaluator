import { NextResponse } from "next/server";
import { savePhaseEvaluation } from "@/services/evaluationService";
import type { SaveProjectEvaluationRequest } from "@/types/evaluation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const facultyId = request.headers.get("x-auth-user-id");

    if (!facultyId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const payload = (await request.json()) as SaveProjectEvaluationRequest;
    const result = await savePhaseEvaluation(projectId, facultyId, payload);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save evaluation";

    return NextResponse.json({ message }, { status: 400 });
  }
}
