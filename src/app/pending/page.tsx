"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { AuthResponse } from "@/types/auth";

export default function PendingPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  async function checkApprovalStatus() {
    setChecking(true);
    setMessage("");

    try {
      const response = await fetch("/api/me", { cache: "no-store" });

      if (!response.ok) {
        router.replace("/login");
        return;
      }

      const data = (await response.json()) as AuthResponse;

      if (data.user.status === "active") {
        router.replace("/dashboard");
        return;
      }

      setMessage("Your account is still pending admin approval.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-ink">
      <section className="w-full max-w-md rounded-lg border border-border bg-surface p-6 text-center shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase text-accent">
          Account pending
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Your faculty account is inactive
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          An admin needs to activate your account before you can access the
          faculty workspace.
        </p>

        <Button
          type="button"
          className="mt-6 w-full"
          loading={checking}
          loadingText="Checking status"
          onClick={checkApprovalStatus}
        >
          Check approval status
        </Button>

        {message ? (
          <p className="mt-4 text-sm font-medium text-muted">{message}</p>
        ) : null}
      </section>
    </main>
  );
}
