import { cookies } from "next/headers";

export const authCookieName = "fyp_token";

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(authCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(authCookieName);
}

export async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(authCookieName)?.value;
}
