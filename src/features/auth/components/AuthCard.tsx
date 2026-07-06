import type { ReactNode } from "react";

type AuthCardProps = {
  children: ReactNode;
  size?: "sm" | "lg";
};

const sizeClasses = {
  sm: "max-w-md",
  lg: "max-w-3xl",
};

export function AuthCard({ children, size = "sm" }: AuthCardProps) {
  return (
    <section
      className={`w-full rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8 ${sizeClasses[size]}`}
    >
      {children}
    </section>
  );
}
