import { NextResponse, type NextRequest } from "next/server";
import { authCookieName } from "@/lib/auth/session";
import { verifyAuthToken } from "@/lib/auth/jwt";

const authRoutes = ["/login", "/register"];
const facultyRoutes = ["/dashboard", "/projects"];
const adminRoutes = ["/admin"];
const protectedRoutes = [...facultyRoutes, ...adminRoutes, "/pending"];

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
  response.cookies.delete(authCookieName);
  return response;
}

function continueWithClearedCookie() {
  const response = NextResponse.next();
  response.cookies.delete(authCookieName);
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const registered = request.nextUrl.searchParams.get("registered") === "1";
  const token = request.cookies.get(authCookieName)?.value;
  const payload = token ? verifyAuthToken(token) : null;
  const isAuthRoute = authRoutes.includes(pathname);
  const isProtectedRoute = startsWithRoute(pathname, protectedRoutes);

  if (!payload) {
    if (token) {
      return redirectWithClearedCookie(request, "/login");
    }

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  const homePath = getHomePath(payload.role);

  if (pathname === "/login" && registered) {
    return continueWithClearedCookie();
  }

  if (isAuthRoute) {
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  if (startsWithRoute(pathname, adminRoutes) && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (startsWithRoute(pathname, facultyRoutes) && payload.role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
