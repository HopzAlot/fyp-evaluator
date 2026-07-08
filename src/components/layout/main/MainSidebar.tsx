"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/ui/Brand";
import { useMainLayout } from "@/components/layout/main/MainLayoutContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/dashboard/projects" },
  { label: "Faculty", href: "/dashboard/faculty" },
];

export function MainSidebar() {
  const pathname = usePathname();
  const { closeSidebar, sidebarOpen } = useMainLayout();

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-ink/30 transition lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeSidebar}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-surface px-4 py-5 transition-transform lg:static lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Brand className="px-2" />

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-accent-soft text-ink"
                    : "text-muted hover:bg-surface-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-md border border-border bg-background p-3">
          <p className="text-sm font-semibold text-ink">Current role</p>
          <p className="mt-1 text-sm text-muted">Faculty workspace</p>
        </div>
      </aside>
    </>
  );
}
