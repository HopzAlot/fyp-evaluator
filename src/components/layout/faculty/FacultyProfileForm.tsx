"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FacultyProfileFields } from "@/components/layout/faculty/FacultyProfileFields";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import type { AuthResponse } from "@/types/auth";
import type { FacultyProfileRequest } from "@/types/faculty";

export function FacultyProfileForm() {
  const { updateUser, user } = useAuth();
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<FacultyProfileRequest>({
    defaultValues: {
      fullName: "",
      contactNumber: "",
      department: "",
      designation: "",
      gender: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    reset({
      fullName: user.fullName ?? "",
      contactNumber: user.contactNumber ?? "",
      department: user.department ?? "",
      designation: user.designation ?? "",
      gender: user.gender ?? "",
    });
  }, [reset, user]);

  const onSubmit = async (values: FacultyProfileRequest) => {
    if (!isDirty) {
      return;
    }

    setFormError("");
    setMessage("");

    const response = await fetch("/api/faculty/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = (await response.json()) as Partial<AuthResponse> & {
      message?: string;
    };

    if (!response.ok || !data.user) {
      setFormError(data.message ?? "Unable to update faculty information");
      return;
    }

    updateUser(data.user);
    setMessage("Faculty information updated successfully.");
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <form
        className="grid gap-5 sm:grid-cols-2"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user?.email ?? ""}
            disabled
            className="h-11 w-full rounded-md border border-border bg-surface-muted px-3 text-sm text-muted outline-none"
          />
        </div>
        <FacultyProfileFields control={control} />

        <div className="sm:col-span-2">
          {formError ? (
            <p className="mb-4 text-sm font-medium text-danger">{formError}</p>
          ) : null}
          {message ? (
            <p className="mb-4 rounded-md border border-accent bg-accent-soft px-3 py-2 text-sm font-medium text-ink">
              {message}
            </p>
          ) : null}
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={!isDirty}
            loading={isSubmitting}
            loadingText="Saving"
          >
            Save information
          </Button>
        </div>
      </form>
    </section>
  );
}
