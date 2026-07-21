"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FacultyProfileFields } from "@/components/layout/faculty/FacultyProfileFields";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import type { AuthResponse } from "@/types/auth";
import type { FacultyProfileRequest } from "@/types/faculty";
import { formatGender } from "@/utils/normalization/facultyNormalization";

const emptyValue = "Not provided";

export function ProfileDetails() {
  const { loading, updateUser, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const isAdmin = user?.role === "admin";
  const isFaculty = user?.role === "faculty";
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
  const profileFields = isAdmin
    ? [
        { label: "Full name", value: user?.fullName },
        { label: "Gender", value: formatGender(user?.gender) },
      ]
    : [
        { label: "Full name", value: user?.fullName },
        { label: "Contact number", value: user?.contactNumber },
        { label: "Department", value: user?.department },
        { label: "Designation", value: user?.designation },
        { label: "Gender", value: formatGender(user?.gender) },
      ];
  const initials = loading
    ? "--"
    : (user?.fullName ?? user?.email ?? "U")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

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

  const cancelEdit = () => {
    setEditing(false);
    setFormError("");
    setMessage("");

    if (user) {
      reset({
        fullName: user.fullName ?? "",
        contactNumber: user.contactNumber ?? "",
        department: user.department ?? "",
        designation: user.designation ?? "",
        gender: user.gender ?? "",
      });
    }
  };

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
    reset(values);
    setEditing(false);
    setMessage("Profile updated successfully.");
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-md bg-primary text-lg font-semibold text-white">
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">
              {loading ? "Loading profile" : user?.fullName ?? user?.email}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {user?.email ?? "Checking session"}
            </p>
          </div>
        </div>
        {isFaculty && !editing ? (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setMessage("");
              setFormError("");
            }}
            className="h-10 rounded-md border border-border px-4 text-sm font-semibold text-ink transition hover:bg-surface-muted"
          >
            Edit
          </button>
        ) : null}
      </div>

      {editing ? (
        <form
          className="mt-5 grid gap-5 sm:grid-cols-2"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-ink"
              htmlFor="email"
            >
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

          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
            {formError ? (
              <p className="text-sm font-medium text-danger">{formError}</p>
            ) : null}
            <div className="flex gap-3 sm:ml-auto">
              <button
                type="button"
                onClick={cancelEdit}
                className="h-11 rounded-md border border-border px-4 text-sm font-semibold text-ink transition hover:bg-surface-muted"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={!isDirty}
                loading={isSubmitting}
                loadingText="Saving"
              >
                Save changes
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase text-muted">Email</p>
            <p className="mt-2 text-sm font-medium text-ink">
              {loading ? "Loading" : user?.email ?? emptyValue}
            </p>
          </div>
          {profileFields.map((field) => (
            <div
              key={field.label}
              className="rounded-md border border-border bg-background p-4"
            >
              <p className="text-xs font-semibold uppercase text-muted">
                {field.label}
              </p>
              <p className="mt-2 text-sm font-medium text-ink">
                {loading ? "Loading" : field.value ?? emptyValue}
              </p>
            </div>
          ))}
        </div>
      )}
      {message ? (
        <p className="mt-4 rounded-md border border-accent bg-accent-soft px-3 py-2 text-sm font-medium text-ink">
          {message}
        </p>
      ) : null}
    </section>
  );
}
