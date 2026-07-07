"use client";

import { usePathname } from "next/navigation";
import { AuthMobileHeader } from "@/components/layout/auth/AuthMobileHeader";
import { AuthSidePanel } from "@/components/layout/auth/AuthSidePanel";

const authLayoutCopy = {
  login: {
    eyebrow: "Login Portal",
    title: "One secure entry point for faculty and admin workflows.",
    description:
      "Use the same login experience to continue into the workspace assigned to your account.",
    cardSize: "max-w-md",
  },
  register: {
    eyebrow: "Faculty Workspace",
    title: "Structured project evaluation for cleaner academic workflows.",
    description:
      "Register faculty profiles, manage secure access, and keep the evaluation experience focused from the first screen.",
    cardSize: "max-w-3xl",
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const copy =
    pathname === "/login" ? authLayoutCopy.login : authLayoutCopy.register;

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <AuthMobileHeader intro={copy} />
        <AuthSidePanel intro={copy} />
        <section
          className={`w-full rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8 ${copy.cardSize}`}
        >
          {children}
        </section>
      </div>
    </main>
  );
}
