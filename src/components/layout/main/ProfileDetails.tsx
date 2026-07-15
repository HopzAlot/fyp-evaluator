"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { formatGender } from "@/utils/normalization/facultyNormalization";

const emptyValue = "Not provided";

export function ProfileDetails() {
  const { loading, user } = useAuth();
  const isAdmin = user?.role === "admin";
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

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
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
    </section>
  );
}
