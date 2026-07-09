import { cookies } from "next/headers";
import type { AuthTokenPair } from "./jwt";

export const accessTokenCookieName = "fyp_accesstoken";
export const refreshTokenCookieName = "fyp_refreshtoken";

export const accessTokenCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 15,
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function setAccessTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(accessTokenCookieName, token, accessTokenCookieOptions);
}

export async function setAuthCookies(tokens: AuthTokenPair) {
  const cookieStore = await cookies();

  cookieStore.set(
    accessTokenCookieName,
    tokens.accessToken,
    accessTokenCookieOptions,
  );
  cookieStore.set(
    refreshTokenCookieName,
    tokens.refreshToken,
    refreshTokenCookieOptions,
  );
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(accessTokenCookieName);
  cookieStore.delete(refreshTokenCookieName);
}

export async function getAuthTokens() {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(accessTokenCookieName)?.value,
    refreshToken: cookieStore.get(refreshTokenCookieName)?.value,
  };
}
