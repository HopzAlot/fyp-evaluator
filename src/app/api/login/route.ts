import { NextResponse } from "next/server";
import { validateLoginPayload } from "@/lib/auth/authValidation";
import { signAuthToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/session";
import { authenticateUser } from "@/lib/auth/users";
import type { LoginRequest } from "@/types/auth";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginRequest;
    const error = validateLoginPayload(payload);

    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const user = await authenticateUser(payload.email, payload.password);

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = signAuthToken({ userId: user.id, role: user.role });
    await setAuthCookie(token);

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { message: "Unable to login right now" },
      { status: 500 },
    );
  }
}
