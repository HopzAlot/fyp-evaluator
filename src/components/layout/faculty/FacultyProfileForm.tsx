"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { matchIsValidTel } from "mui-tel-input";
import { FormPhoneField } from "@/components/fields/FormPhoneField";
import { FormSelectField } from "@/components/fields/FormSelectField";
import { FormTextField } from "@/components/fields/FormTextField";
import { genderOptions } from "@/components/layout/auth/authOptions";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import type { AuthResponse, FacultyProfileRequest } from "@/types/auth";
import { noHtmlValidation } from "@/utils/validation/formValidation";

export function FacultyProfileForm() {
  const { updateUser, user } = useAuth();
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
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
        <FormTextField
          control={control}
          name="fullName"
          label="Full name"
          placeholder="Enter name"
          rules={{
            required: "Full name is required",
            minLength: {
              value: 3,
              message: "Full name must be at least 3 characters",
            },
            validate: noHtmlValidation,
          }}
        />
        <FormSelectField
          control={control}
          name="gender"
          label="Gender"
          options={genderOptions}
          rules={{ required: "Gender is required" }}
        />
        <FormPhoneField
          control={control}
          name="contactNumber"
          label="Contact number"
          defaultCountry="PK"
          placeholder="Enter contact number"
          rules={{
            required: "Contact number is required",
            validate: {
              noHtml: noHtmlValidation,
              validPhone: (value) =>
                matchIsValidTel(value) || "Enter a valid contact number",
            },
          }}
        />
        <FormTextField
          control={control}
          name="department"
          label="Department"
          placeholder="Enter department"
          rules={{
            required: "Department is required",
            validate: noHtmlValidation,
          }}
        />
        <FormTextField
          control={control}
          name="designation"
          label="Designation"
          placeholder="Enter designation"
          rules={{
            required: "Designation is required",
            validate: noHtmlValidation,
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
