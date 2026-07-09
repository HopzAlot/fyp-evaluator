import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth/session";
import { createFacultyProfile } from "@/services/facultyService";
import {
  createUserAccount,
  deleteUserAccount,
  toAuthUser,
} from "@/services/userService";
import type { RegisterFacultyRequest } from "@/types/auth";
import { validateFacultyRegisterPayload } from "@/utils/validation/authValidation";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterFacultyRequest;
    const error = validateFacultyRegisterPayload(payload);

    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const userAccount = await createUserAccount({
      email: payload.email,
      password: payload.password,
      role: "faculty",
      status: "inactive",
    });

    if (!userAccount) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 },
      );
    }

    let user;

    try {
      const faculty = await createFacultyProfile(userAccount._id, payload);
      user = toAuthUser(userAccount, faculty);
    } catch (error) {
      await deleteUserAccount(userAccount._id);
      throw error;
    }

    await clearAuthCookies();

    return NextResponse.json(
      {
        message: "Registration successful. Please login after admin approval.",
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json(
      { message: "Unable to register right now" },
      { status: 500 },
    );
  }
}
