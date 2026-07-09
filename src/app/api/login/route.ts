import { NextResponse } from "next/server";
import { createAuthTokens } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/session";
import { getFacultyByUserId } from "@/services/facultyService";
import { authenticateUser, toAuthUser } from "@/services/userService";
import type { LoginRequest } from "@/types/auth";
import { validateLoginPayload } from "@/utils/validation/authValidation";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginRequest;
    const error = validateLoginPayload(payload);

    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const userAccount = await authenticateUser(payload.email, payload.password);

    if (!userAccount) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    if (userAccount.status !== "active") {
      return NextResponse.json(
        { message: "Kindly contact admin, your account is not active." },
        { status: 403 },
      );
    }

    const faculty =
      userAccount.role === "faculty"
        ? await getFacultyByUserId(userAccount._id)
        : null;
    const user = toAuthUser(userAccount, faculty);
    const tokens = createAuthTokens({
      userId: user.id,
      role: user.role,
      status: user.status,
    });
    await setAuthCookies(tokens);

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { message: "Unable to login right now" },
      { status: 500 },
    );
  }
}
