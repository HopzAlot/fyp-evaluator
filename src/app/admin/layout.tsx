import type { ReactNode } from "react";
import { MainLayoutProvider } from "@/components/layout/main/MainLayoutContext";
import { MainLayoutShell } from "@/components/layout/main/MainLayoutShell";
import { AuthProvider } from "@/components/providers/AuthProvider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <MainLayoutProvider>
        <MainLayoutShell>{children}</MainLayoutShell>
      </MainLayoutProvider>
    </AuthProvider>
  );
}
