import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { getAuthCookie } from "@/lib/auth/session";
import { getUserById } from "@/lib/auth/users";

export async function GET() {
  const token = await getAuthCookie();
  const payload = token ? verifyAuthToken(token) : null;
  const user = payload ? await getUserById(payload.userId) : null;

  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
