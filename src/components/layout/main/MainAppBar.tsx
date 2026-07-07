"use client";

import { useMainLayout } from "@/components/layout/main/MainLayoutContext";

export function MainAppBar() {
  const { toggleSidebar } = useMainLayout();

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
            <p className="text-sm font-semibold text-ink">Dashboard</p>
            <p className="text-sm text-muted">Monitor FYP evaluation activity</p>
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
