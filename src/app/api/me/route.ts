import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { getAuthCookie } from "@/lib/auth/session";
import { getFacultyByUserId } from "@/services/facultyService";
import { getUserById, toAuthUser } from "@/services/userService";

export async function GET() {
  const token = await getAuthCookie();
  const payload = token ? verifyAuthToken(token) : null;
  const userAccount = payload ? await getUserById(payload.userId) : null;

  if (!userAccount) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const faculty =
    userAccount.role === "faculty"
      ? await getFacultyByUserId(userAccount._id)
      : null;
  const user = toAuthUser(userAccount, faculty);

  return NextResponse.json({ user });
}
