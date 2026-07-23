import { NextResponse } from "next/server";
import {
  signAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";
import {
  accessTokenCookieOptions,
  accessTokenCookieName,
  getAuthTokens,
  refreshTokenCookieName,
} from "@/lib/auth/session";
import { getFacultyByUserId } from "@/services/facultyService";
import { getUserById, toAuthUser } from "@/services/userService";

export async function GET() {
  const { accessToken, refreshToken } = await getAuthTokens();
  const accessPayload = accessToken ? verifyAccessToken(accessToken) : null;
  const refreshPayload =
    !accessPayload && refreshToken ? verifyRefreshToken(refreshToken) : null;
  const payload = accessPayload ?? refreshPayload;
  const userAccount = payload ? await getUserById(payload.userId) : null;

  if (!userAccount || userAccount.status !== "active") {
    const response = NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 },
    );

    response.cookies.delete(accessTokenCookieName);
    response.cookies.delete(refreshTokenCookieName);
    return response;
  }

  const faculty =
    userAccount.role === "faculty"
      ? await getFacultyByUserId(userAccount._id)
      : null;
  const user = toAuthUser(userAccount, faculty);
  const response = NextResponse.json({ user });

  if (!accessPayload && refreshPayload) {
    response.cookies.set(
      accessTokenCookieName,
      signAccessToken({
        userId: user.id,
        role: user.role,
        status: user.status,
      }),
      accessTokenCookieOptions,
    );
  }

  return response;
}
