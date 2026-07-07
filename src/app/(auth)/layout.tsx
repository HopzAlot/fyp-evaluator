"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/ui/Brand";

const authLayoutCopy = {
  login: {
    eyebrow: "Login Portal",
    title: "One secure entry point for faculty and admin workflows.",
    description:
      "Use the same login experience to continue into the workspace assigned to your account.",
    cardSize: "max-w-md",
    switchLabel: "New faculty member?",
    switchHref: "/register",
    switchText: "Register",
  },
  register: {
    eyebrow: "Faculty Workspace",
    title: "Structured project evaluation for cleaner academic workflows.",
    description:
      "Register faculty profiles, manage secure access, and keep the evaluation experience focused from the first screen.",
    cardSize: "max-w-3xl",
    switchLabel: "Already registered?",
    switchHref: "/login",
    switchText: "Login",
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
        <header className="mx-auto w-full max-w-3xl lg:hidden">
          <Brand />
          <p className="mt-5 text-sm font-semibold uppercase text-accent">
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">
            {copy.title}
          </h1>
        </header>

        <aside className="hidden lg:block">
          <Brand className="mb-8" />
          <div className="max-w-md">
            <p className="mb-4 text-sm font-semibold uppercase text-accent">
              {copy.eyebrow}
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink">
              {copy.title}
            </h1>
            <p className="mt-5 text-base leading-7 text-muted">
              {copy.description}
            </p>
          </div>
        </aside>

        <section
          className={`w-full rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8 ${copy.cardSize}`}
        >
          {children}
          <p className="mt-6 text-center text-sm text-muted">
            {copy.switchLabel}{" "}
            <Link
              href={copy.switchHref}
              className="font-semibold text-primary hover:underline"
            >
              {copy.switchText}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
