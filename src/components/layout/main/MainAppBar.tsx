"use client";

import { usePathname } from "next/navigation";
import { useMainLayout } from "@/components/layout/main/MainLayoutContext";

const pageCopy = {
  dashboard: {
    title: "Dashboard",
    description: "Monitor FYP evaluation activity",
  },
  projects: {
    title: "Projects",
    description: "Review assigned projects and evaluations",
  },
};

export function MainAppBar() {
  const pathname = usePathname();
  const { toggleSidebar } = useMainLayout();
  const copy = pathname.startsWith("/projects")
    ? pageCopy.projects
    : pageCopy.dashboard;

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
          <div className="text-right">
            <p className="text-sm font-semibold text-ink">Faculty User</p>
            <p className="text-xs text-muted">faculty@university.edu</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-semibold text-white">
            FU
          </div>
        </div>
      </div>
    </header>
  );
}
