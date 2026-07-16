import { NextResponse } from "next/server";
import { updateFacultyPasswordByAdmin } from "@/services/userService";
import type { AdminFacultyPasswordRequest } from "@/types/faculty";
import { validateAdminFacultyPasswordPayload } from "@/utils/validation/authValidation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const values = (await request.json()) as AdminFacultyPasswordRequest;
    const error = validateAdminFacultyPasswordPayload(values);

    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const updateError = await updateFacultyPasswordByAdmin(
      userId,
      values.newPassword,
    );

    if (updateError) {
      return NextResponse.json({ message: updateError }, { status: 400 });
    }

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Admin faculty password update error", error);
    return NextResponse.json(
      { message: "Unable to update password right now" },
      { status: 500 },
    );
  }
}
