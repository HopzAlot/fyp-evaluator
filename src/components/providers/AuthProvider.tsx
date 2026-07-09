"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AuthResponse, AuthUser } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/me", { cache: "no-store" });

        if (!response.ok) {
          if (active) {
            setUser(null);
            router.replace("/login");
          }
          return;
        }

        const data = (await response.json()) as AuthResponse;

        if (active) {
          setUser(data.user);

          if (
            data.user.role === "faculty" &&
            data.user.status !== "active" &&
            pathname !== "/pending"
          ) {
            router.replace("/pending");
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      logout: async () => {
        await fetch("/api/logout", { method: "POST" });
        setUser(null);
        router.replace("/login");
      },
    }),
    [loading, router, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
