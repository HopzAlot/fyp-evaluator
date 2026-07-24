"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleUserRound,
  FolderKanban,
  LayoutDashboard,
  UsersRound,
} from "lucide-react";
import { Brand } from "@/components/ui/Brand";
import { useMainLayout } from "@/components/layout/main/MainLayoutContext";
import { useAuth } from "@/components/providers/AuthProvider";

const facultyNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Profile", href: "/profile", icon: CircleUserRound },
];

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Manage Users", href: "/admin/faculty", icon: UsersRound },
];

export function MainSidebar() {
  const pathname = usePathname();
  const { closeSidebar, sidebarCollapsed, sidebarOpen } = useMainLayout();
  const { user } = useAuth();
  const isAdmin = pathname.startsWith("/admin") || user?.role === "admin";
  const navItems = isAdmin ? adminNavItems : facultyNavItems;
  const workspaceLabel = isAdmin ? "Admin workspace" : "Faculty workspace";

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-ink/30 transition lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeSidebar}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-surface px-4 py-5 transition-all lg:static lg:z-auto lg:translate-x-0 ${
          sidebarCollapsed ? "lg:w-[4.75rem] lg:px-3" : "lg:w-72"
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Brand
          compact={sidebarCollapsed}
          className={sidebarCollapsed ? "px-2 lg:px-0" : "px-2"}
        />

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (!["/admin", "/dashboard"].includes(item.href) &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                  sidebarCollapsed ? "lg:justify-center lg:px-2" : ""
                } ${
                  active
                    ? "bg-accent-soft text-ink"
                    : "text-muted hover:bg-surface-muted hover:text-ink"
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                <span className={sidebarCollapsed ? "lg:hidden" : ""}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div
          className={`mt-auto rounded-md border border-border bg-background p-3 ${
            sidebarCollapsed ? "lg:hidden" : ""
          }`}
        >
          <p className="text-sm font-semibold text-ink">Current role</p>
          <p className="mt-1 text-sm text-muted">{workspaceLabel}</p>
        </div>
      </aside>
    </>
  );
}
