"use client";

import type { ReactNode } from "react";
import { MainAppBar } from "@/components/layout/main/MainAppBar";
import { useMainLayout } from "@/components/layout/main/MainLayoutContext";
import { MainSidebar } from "@/components/layout/main/MainSidebar";

export function MainLayoutShell({ children }: { children: ReactNode }) {
  const { sidebarCollapsed } = useMainLayout();

  return (
    <div
      className={`min-h-screen bg-background text-ink lg:grid ${
        sidebarCollapsed ? "lg:grid-cols-[4.75rem_1fr]" : "lg:grid-cols-[18rem_1fr]"
      }`}
    >
      <MainSidebar />
      <div className="min-w-0">
        <MainAppBar />
        <main className="px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
