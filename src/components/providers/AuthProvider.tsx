"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthResponse, AuthUser } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/me", { cache: "no-store" });

        if (!response.ok) {
          if (
            active &&
            (response.status === 401 || response.status === 403)
          ) {
            setUser(null);
            router.replace("/login");
          }
          return;
        }

        const data = (await response.json()) as AuthResponse;

        if (active) {
          setUser(data.user);
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
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      logout: async () => {
        await fetch("/api/logout", { method: "POST" });
        setUser(null);
        router.replace("/login");
      },
      updateUser: setUser,
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
