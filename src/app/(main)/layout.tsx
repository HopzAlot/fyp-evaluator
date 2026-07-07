import type { ReactNode } from "react";
import { MainLayoutShell } from "@/components/layout/main/MainLayoutShell";

export default function MainLayout({ children }: { children: ReactNode }) {
  return <MainLayoutShell>{children}</MainLayoutShell>;
}
