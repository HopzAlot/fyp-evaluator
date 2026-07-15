import { NextResponse } from "next/server";
import {
  getFacultyByUserId,
  updateFacultyProfile,
} from "@/services/facultyService";
import {
  getUserById,
  toAuthUser,
  updateUserProfileFields,
} from "@/services/userService";
import type { FacultyProfileRequest } from "@/types/faculty";
import { validateFacultyProfilePayload } from "@/utils/validation/authValidation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const values = (await request.json()) as FacultyProfileRequest;
    const error = validateFacultyProfilePayload(values);

    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const userAccount = await getUserById(userId);

    if (!userAccount || userAccount.role !== "faculty") {
      return NextResponse.json(
        { message: "Faculty user not found" },
        { status: 404 },
      );
    }

    const updatedUser =
      (await updateUserProfileFields(userId, {
        fullName: values.fullName,
        gender: values.gender,
      })) ?? userAccount;
    const faculty =
      (await updateFacultyProfile(userAccount._id, values)) ??
      (await getFacultyByUserId(userAccount._id));

    if (!faculty) {
      return NextResponse.json(
        { message: "Faculty profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ user: toAuthUser(updatedUser, faculty) });
  } catch (error) {
    console.error("Admin faculty update error", error);
    return NextResponse.json(
      { message: "Unable to update faculty information right now" },
      { status: 500 },
    );
  }
}
