"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormTextField } from "@/components/fields/FormTextField";
import { FacultyProfileFields } from "@/components/layout/faculty/FacultyProfileFields";
import { Button } from "@/components/ui/Button";
import type { AdminFacultyUser, FacultyProfileRequest } from "@/types/faculty";
import { noHtmlValidation } from "@/utils/validation/formValidation";

type AdminFacultyEditFormProps = {
  faculty: AdminFacultyUser;
};

export function AdminFacultyEditForm({ faculty }: AdminFacultyEditFormProps) {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FacultyProfileRequest>({
    defaultValues: {
      fullName: faculty.fullName ?? "",
      contactNumber: faculty.contactNumber ?? "",
      department: faculty.department ?? "",
      designation: faculty.designation ?? "",
      gender: faculty.gender ?? "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: FacultyProfileRequest) => {
    const response = await fetch(`/api/admin/faculty/${faculty.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await response.json()) as {
      message?: string;
      user?: AdminFacultyUser;
    };

    if (!response.ok || !data.user) {
      setError("root", {
        message: data.message ?? "Unable to update faculty information",
      });
      return;
    }

    router.push("/admin/faculty");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">User</h2>
        </div>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 px-5 py-5 md:grid-cols-2">
            <FormTextField
              control={control}
              name="fullName"
              label="Name"
              placeholder="Enter full name"
              rules={{
                required: "Name is required",
                minLength: {
                  value: 3,
                  message: "Name must be at least 3 characters",
                },
                validate: noHtmlValidation,
              }}
            />
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
                value={faculty.email}
                disabled
                className="h-11 w-full rounded-md border border-border bg-surface-muted px-3 text-sm text-muted outline-none"
              />
            </div>
            <FacultyProfileFields control={control} hideFullName />
          </div>

          <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
            {errors.root?.message ? (
              <p className="text-sm font-medium text-danger">
                {errors.root.message}
              </p>
            ) : null}
            <Button type="submit" loading={isSubmitting} loadingText="Updating">
              Update
            </Button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">Security</h2>
        </div>
        <div className="grid gap-5 px-5 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-ink"
              htmlFor="new-password"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              disabled
              placeholder="New Password"
              className="h-11 w-full rounded-md border border-border bg-surface-muted px-3 text-sm text-muted outline-none"
            />
          </div>
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-ink"
              htmlFor="confirm-password"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              disabled
              placeholder="Confirm Password"
              className="h-11 w-full rounded-md border border-border bg-surface-muted px-3 text-sm text-muted outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end border-t border-border px-5 py-4">
          <button
            type="button"
            disabled
            className="h-11 rounded-md bg-muted px-5 text-sm font-semibold text-white disabled:cursor-not-allowed"
          >
            Update
          </button>
        </div>
      </section>
    </div>
  );
}
