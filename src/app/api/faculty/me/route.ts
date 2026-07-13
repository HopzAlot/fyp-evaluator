import { NextResponse } from "next/server";
import {
  getFacultyByUserId,
  updateFacultyProfile,
} from "@/services/facultyService";
import { getUserById, toAuthUser } from "@/services/userService";
import type { FacultyProfileRequest } from "@/types/auth";
import { validateFacultyProfilePayload } from "@/utils/validation/authValidation";

export async function PATCH(request: Request) {
  try {
    const userId = request.headers.get("x-auth-user-id");

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const values = (await request.json()) as FacultyProfileRequest;
    const error = validateFacultyProfilePayload(values);

    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const userAccount = await getUserById(userId);

    if (!userAccount) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const faculty =
      (await updateFacultyProfile(userAccount._id, values)) ??
      (await getFacultyByUserId(userAccount._id));

    if (!faculty) {
      return NextResponse.json(
        { message: "Faculty profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ user: toAuthUser(userAccount, faculty) });
  } catch (error) {
    console.error("Faculty profile update error", error);
    return NextResponse.json(
      { message: "Unable to update faculty profile right now" },
      { status: 500 },
    );
  }
}
