import { NextResponse } from "next/server";
import { buildEvaluationResultsExportHtml } from "@/services/evaluationService";

export async function GET() {
  try {
    const html = await buildEvaluationResultsExportHtml();

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
