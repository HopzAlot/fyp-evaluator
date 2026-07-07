"use client";

import { usePathname } from "next/navigation";

type AuthIntroProps = {
  compact?: boolean;
};

const authIntroCopy = {
  login: {
    eyebrow: "Login Portal",
    title: "One secure entry point for faculty and admin workflows.",
    description:
      "Use the same login experience to continue into the workspace assigned to your account.",
  },
  register: {
    eyebrow: "Faculty Workspace",
    title: "Structured project evaluation for cleaner academic workflows.",
    description:
      "Register faculty profiles, manage secure access, and keep the evaluation experience focused from the first screen.",
  },
};

export function AuthIntro({ compact = false }: AuthIntroProps) {
  const pathname = usePathname();
  const copy = pathname === "/login" ? authIntroCopy.login : authIntroCopy.register;

  return (
    <div className={compact ? "" : "max-w-md"}>
      <p
        className={
          compact
            ? "mt-5 text-sm font-semibold uppercase text-accent"
            : "mb-4 text-sm font-semibold uppercase text-accent"
        }
      >
        {copy.eyebrow}
      </p>
      <h1
        className={
          compact
            ? "mt-2 max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl"
            : "text-4xl font-semibold leading-tight tracking-tight text-ink"
        }
      >
        {copy.title}
      </h1>
      {!compact ? (
        <p className="mt-5 text-base leading-7 text-muted">{copy.description}</p>
      ) : null}
    </div>
  );
}
