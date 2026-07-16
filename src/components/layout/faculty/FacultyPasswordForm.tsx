"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormTextField } from "@/components/fields/FormTextField";
import { Button } from "@/components/ui/Button";
import type { FacultyPasswordRequest } from "@/types/faculty";

const emptyPasswordValues: FacultyPasswordRequest = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function FacultyPasswordForm() {
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<FacultyPasswordRequest>({
    defaultValues: emptyPasswordValues,
    mode: "onChange",
  });

  const onSubmit = async (values: FacultyPasswordRequest) => {
    if (!isDirty) {
      return;
    }

    setFormError("");
    setMessage("");

    const response = await fetch("/api/faculty/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      setFormError(data.message ?? "Unable to update password");
      return;
    }

    reset(emptyPasswordValues);
    setMessage(data.message ?? "Password updated successfully.");
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="border-b border-border pb-4">
        <h2 className="text-base font-semibold text-ink">Security</h2>
      </div>
      <form
        className="mt-5 grid gap-5 sm:grid-cols-2"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormTextField
          control={control}
          name="currentPassword"
          label="Current password"
          type="password"
          placeholder="Enter current password"
          rules={{ required: "Current password is required" }}
        />
        <FormTextField
          control={control}
          name="newPassword"
          label="New password"
          type="password"
          placeholder="Enter new password"
          rules={{
            required: "New password is required",
            minLength: {
              value: 8,
              message: "New password must be at least 8 characters",
            },
            validate: (value, formValues) =>
              value !== formValues.currentPassword ||
              "New password must be different from current password",
          }}
        />
        <FormTextField
          control={control}
          name="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Confirm new password"
          rules={{
            required: "Confirm password is required",
            validate: (value, formValues) =>
              value === formValues.newPassword || "Passwords do not match",
          }}
        />

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
            loadingText="Updating"
          >
            Update password
          </Button>
        </div>
      </form>
    </section>
  );
}
