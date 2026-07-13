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
const facultyRoutes = ["/dashboard", "/projects", "/faculty"];
const adminRoutes = ["/admin"];
const sharedProtectedRoutes = ["/profile"];
const adminApiRoutes = ["/api/admin"];
const facultyApiRoutes = ["/api/faculty"];
const sharedProtectedApiRoutes = ["/api/me"];
const protectedRoutes = [
  ...facultyRoutes,
  ...adminRoutes,
  ...sharedProtectedRoutes,
];
const protectedApiRoutes = [
  ...adminApiRoutes,
  ...facultyApiRoutes,
  ...sharedProtectedApiRoutes,
];

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

function unauthorizedApiResponse() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

function forbiddenApiResponse() {
  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

function refreshAccessCookie(response: NextResponse, payload: AuthPayload) {
  response.cookies.set(
    accessTokenCookieName,
    signAccessToken(payload),
    accessTokenCookieOptions,
  );
}

function continueWithAuthHeaders(request: NextRequest, payload: AuthPayload) {
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-auth-user-id", payload.userId);
  requestHeaders.set("x-auth-role", payload.role);
  requestHeaders.set("x-auth-status", payload.status);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
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
  const isProtectedApiRoute = startsWithRoute(pathname, protectedApiRoutes);
  const isApiRoute = pathname.startsWith("/api");

  if (pathname === "/login" && registered) {
    return continueWithClearedCookie();
  }

  if (!payload) {
    if (isProtectedApiRoute) {
      const response = unauthorizedApiResponse();

      if (accessToken || refreshToken) {
        clearTokenCookies(response);
      }

      return response;
    }

    if (isApiRoute) {
      const response = NextResponse.next();

      if (accessToken || refreshToken) {
        clearTokenCookies(response);
      }

      return response;
    }

    if (accessToken || refreshToken) {
      return redirectWithClearedCookie(request, "/login");
    }

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  const homePath = getHomePath(payload.role);

  if (startsWithRoute(pathname, adminApiRoutes) && payload.role !== "admin") {
    const response = forbiddenApiResponse();

    if (!accessPayload && refreshPayload) {
      refreshAccessCookie(response, refreshPayload);
    }

    return response;
  }

  if (
    startsWithRoute(pathname, facultyApiRoutes) &&
    payload.role !== "faculty"
  ) {
    const response = forbiddenApiResponse();

    if (!accessPayload && refreshPayload) {
      refreshAccessCookie(response, refreshPayload);
    }

    return response;
  }

  if (isProtectedApiRoute) {
    const response = continueWithAuthHeaders(request, payload);

    if (!accessPayload && refreshPayload) {
      refreshAccessCookie(response, refreshPayload);
    }

    return response;
  }

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
