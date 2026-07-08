import { NextResponse } from "next/server";
import { validateFacultyRegisterPayload } from "@/lib/auth/authValidation";
import { signAuthToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/session";
import { createFacultyUser } from "@/lib/auth/users";
import type { RegisterFacultyRequest } from "@/types/auth";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterFacultyRequest;
    const error = validateFacultyRegisterPayload(payload);

    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const user = await createFacultyUser(payload);

    if (!user) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const token = signAuthToken({ userId: user.id, role: user.role });
    await setAuthCookie(token);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json(
      { message: "Unable to register right now" },
      { status: 500 },
    );
  }
}
