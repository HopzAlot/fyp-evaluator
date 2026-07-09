import jwt from "jsonwebtoken";
import type { UserRole, UserStatus } from "@/types/auth";

export type AuthTokenPayload = {
  userId: string;
  role: UserRole;
  status: UserStatus;
};

export type AuthTokenPair = {
  accessToken: string;
  refreshToken: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

export function signAccessToken(payload: AuthTokenPayload) {
  return jwt.sign({ ...payload, tokenType: "access" }, getJwtSecret(), {
    expiresIn: "15m",
  });
}

export function signRefreshToken(payload: AuthTokenPayload) {
  return jwt.sign({ ...payload, tokenType: "refresh" }, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export function createAuthTokens(payload: AuthTokenPayload): AuthTokenPair {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

function verifyToken(token: string, tokenType: "access" | "refresh") {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as AuthTokenPayload & {
      tokenType?: string;
    };

    if (payload.tokenType !== tokenType) {
      return null;
    }

    return {
      userId: payload.userId,
      role: payload.role,
      status: payload.status,
    };
  } catch {
    return null;
  }
}

export function verifyAccessToken(token: string) {
  return verifyToken(token, "access");
}

export function verifyRefreshToken(token: string) {
  return verifyToken(token, "refresh");
}
