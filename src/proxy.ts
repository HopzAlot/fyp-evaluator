import { NextResponse, type NextRequest } from "next/server";
import {
  accessTokenCookieName,
  accessTokenCookieOptions,
  refreshTokenCookieName,
} from "@/lib/auth/session";
import {
  signAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";
import type { UserRole, UserStatus } from "@/types/auth";

const authRoutes = ["/login", "/register"];
const facultyRoutes = ["/dashboard", "/projects"];
const adminRoutes = ["/admin"];
const protectedRoutes = [...facultyRoutes, ...adminRoutes];

function startsWithRoute(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function getHomePath(role: string) {
  if (role === "admin") {
    return "/admin";
  }

  return "/dashboard";
}

function redirectWithClearedCookie(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url));
  clearTokenCookies(response);
  return response;
}

function continueWithClearedCookie() {
  const response = NextResponse.next();
  clearTokenCookies(response);
  return response;
}

function clearTokenCookies(response: NextResponse) {
  response.cookies.delete(accessTokenCookieName);
  response.cookies.delete(refreshTokenCookieName);
}

function refreshAccessCookie(response: NextResponse, payload: AuthPayload) {
  response.cookies.set(
    accessTokenCookieName,
    signAccessToken(payload),
    accessTokenCookieOptions,
  );
}

type AuthPayload = {
  userId: string;
  role: UserRole;
  status: UserStatus;
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const registered = request.nextUrl.searchParams.get("registered") === "1";
  const accessToken = request.cookies.get(accessTokenCookieName)?.value;
  const refreshToken = request.cookies.get(refreshTokenCookieName)?.value;
  const accessPayload = accessToken ? verifyAccessToken(accessToken) : null;
  const refreshPayload =
    !accessPayload && refreshToken ? verifyRefreshToken(refreshToken) : null;
  const payload = accessPayload ?? refreshPayload;
  const isAuthRoute = authRoutes.includes(pathname);
  const isProtectedRoute = startsWithRoute(pathname, protectedRoutes);

  if (pathname === "/login" && registered) {
    return continueWithClearedCookie();
  }

  if (!payload) {
    if (accessToken || refreshToken) {
      return redirectWithClearedCookie(request, "/login");
    }

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  const homePath = getHomePath(payload.role);

  if (isAuthRoute) {
    const response = NextResponse.redirect(new URL(homePath, request.url));

    if (!accessPayload && refreshPayload) {
      refreshAccessCookie(response, refreshPayload);
    }

    return response;
  }

  if (startsWithRoute(pathname, adminRoutes) && payload.role !== "admin") {
    const response = NextResponse.redirect(new URL("/unauthorized", request.url));

    if (!accessPayload && refreshPayload) {
      refreshAccessCookie(response, refreshPayload);
    }

    return response;
  }

  if (startsWithRoute(pathname, facultyRoutes) && payload.role === "admin") {
    const response = NextResponse.redirect(new URL("/admin", request.url));

    if (!accessPayload && refreshPayload) {
      refreshAccessCookie(response, refreshPayload);
    }

    return response;
  }

  const response = NextResponse.next();

  if (!accessPayload && refreshPayload) {
    refreshAccessCookie(response, refreshPayload);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
