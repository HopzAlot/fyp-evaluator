import { NextResponse } from "next/server";
import { updateUserPassword } from "@/services/userService";
import type { FacultyPasswordRequest } from "@/types/faculty";
import { validateFacultyPasswordPayload } from "@/utils/validation/authValidation";

export async function PATCH(request: Request) {
  try {
    const userId = request.headers.get("x-auth-user-id");

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const values = (await request.json()) as FacultyPasswordRequest;
    const error = validateFacultyPasswordPayload(values);

    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const updateError = await updateUserPassword(
      userId,
      values.currentPassword,
      values.newPassword,
    );

    if (updateError) {
      return NextResponse.json({ message: updateError }, { status: 400 });
    }

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Faculty password update error", error);
    return NextResponse.json(
      { message: "Unable to update password right now" },
      { status: 500 },
    );
  }
}
