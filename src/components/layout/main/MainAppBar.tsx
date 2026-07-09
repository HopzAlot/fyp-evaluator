"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMainLayout } from "@/components/layout/main/MainLayoutContext";
import { useAuth } from "@/components/providers/AuthProvider";

const pageCopy = {
  dashboard: {
    title: "Dashboard",
    description: "Monitor FYP evaluation activity",
  },
  projects: {
    title: "Projects",
    description: "Review assigned projects and evaluations",
  },
  profile: {
    title: "Profile",
    description: "View your account and faculty information",
  },
};

export function MainAppBar() {
  const pathname = usePathname();
  const { toggleSidebar } = useMainLayout();
  const { loading, logout, user } = useAuth();
  const copy = pathname.startsWith("/projects")
    ? pageCopy.projects
    : pathname.startsWith("/profile")
      ? pageCopy.profile
      : pageCopy.dashboard;
  const displayName = user?.fullName ?? user?.email ?? "Loading";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-ink transition hover:bg-surface-muted lg:hidden"
            aria-label="Toggle sidebar"
          >
            <span className="h-0.5 w-5 rounded bg-current shadow-[0_6px_0_current,0_-6px_0_current]" />
          </button>
          <div>
            <p className="text-sm font-semibold text-ink">{copy.title}</p>
            <p className="text-sm text-muted">{copy.description}</p>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-md px-2 py-1 transition hover:bg-surface-muted"
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">
                {loading ? "Loading user" : displayName}
              </p>
              <p className="text-xs text-muted">
                {user?.email ?? "Checking session"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-semibold text-white">
              {loading ? "--" : initials}
            </div>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="h-10 rounded-md border border-border px-3 text-sm font-semibold text-ink transition hover:bg-surface-muted"
          >
            Logout
          </button>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-semibold text-white"
            aria-label="Open profile"
          >
            {loading ? "--" : initials}
          </Link>
          <button
            type="button"
            onClick={logout}
            className="h-10 rounded-md border border-border px-3 text-sm font-semibold text-ink transition hover:bg-surface-muted"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
