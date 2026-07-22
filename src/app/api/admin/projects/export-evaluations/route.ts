import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { buildEvaluationResultsExportHtml } from "@/services/evaluationService";

export async function GET(request: Request) {
  try {
    const phaseIds = new URL(request.url).searchParams.getAll("phaseId");

    if (phaseIds.some((phaseId) => !isValidObjectId(phaseId))) {
      return NextResponse.json(
        { message: "Invalid evaluation phase selected" },
        { status: 400 },
      );
    }

    const html = await buildEvaluationResultsExportHtml(phaseIds);

    return new Response(html, {
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="fyp-evaluation-results.xls"',
      },
    });
  } catch (error) {
    console.error("Evaluation results export error", error);

    return NextResponse.json(
      { message: "Unable to export evaluation results right now" },
      { status: 500 },
    );
  }
}
