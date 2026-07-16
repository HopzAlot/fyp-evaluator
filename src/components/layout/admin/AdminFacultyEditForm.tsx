"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormTextField } from "@/components/fields/FormTextField";
import { FacultyProfileFields } from "@/components/layout/faculty/FacultyProfileFields";
import { Button } from "@/components/ui/Button";
import type {
  AdminFacultyPasswordRequest,
  AdminFacultyUser,
  FacultyProfileRequest,
} from "@/types/faculty";
import { noHtmlValidation } from "@/utils/validation/formValidation";

type AdminFacultyEditFormProps = {
  faculty: AdminFacultyUser;
};

export function AdminFacultyEditForm({ faculty }: AdminFacultyEditFormProps) {
  const router = useRouter();
  const {
    control,
    handleSubmit: handleProfileSubmit,
    formState: {
      errors: profileErrors,
      isDirty: isProfileDirty,
      isSubmitting: isProfileSubmitting,
    },
    setError: setProfileError,
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
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: {
      errors: passwordErrors,
      isDirty: isPasswordDirty,
      isSubmitting: isPasswordSubmitting,
    },
    setError: setPasswordError,
  } = useForm<AdminFacultyPasswordRequest>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onProfileSubmit = async (values: FacultyProfileRequest) => {
    if (!isProfileDirty) {
      return;
    }

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
      setProfileError("root", {
        message: data.message ?? "Unable to update faculty information",
      });
      return;
    }

    router.push("/admin/faculty");
    router.refresh();
  };

  const onPasswordSubmit = async (values: AdminFacultyPasswordRequest) => {
    if (!isPasswordDirty) {
      return;
    }

    const response = await fetch(`/api/admin/faculty/${faculty.id}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      setPasswordError("root", {
        message: data.message ?? "Unable to update password",
      });
      return;
    }

    resetPasswordForm();
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">User</h2>
        </div>

        <form noValidate onSubmit={handleProfileSubmit(onProfileSubmit)}>
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
            {profileErrors.root?.message ? (
              <p className="text-sm font-medium text-danger">
                {profileErrors.root.message}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={!isProfileDirty}
              loading={isProfileSubmitting}
              loadingText="Updating"
            >
              Update
            </Button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">Security</h2>
        </div>
        <form
          noValidate
          onSubmit={handlePasswordSubmit(onPasswordSubmit)}
        >
          <div className="grid gap-5 px-5 py-5 md:grid-cols-2">
            <FormTextField
              control={passwordControl}
              name="newPassword"
              label="New Password"
              type="password"
              placeholder="New Password"
              rules={{
                required: "New password is required",
                minLength: {
                  value: 8,
                  message: "New password must be at least 8 characters",
                },
              }}
            />
            <FormTextField
              control={passwordControl}
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm Password"
              rules={{
                required: "Confirm password is required",
                validate: (value, formValues) =>
                  value === formValues.newPassword || "Passwords do not match",
              }}
            />
          </div>
          <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
            {passwordErrors.root?.message ? (
              <p className="text-sm font-medium text-danger">
                {passwordErrors.root.message}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={!isPasswordDirty}
              loading={isPasswordSubmitting}
              loadingText="Updating"
            >
              Update
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
