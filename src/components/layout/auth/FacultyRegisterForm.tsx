"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { matchIsValidTel } from "mui-tel-input";
import { FormPhoneField } from "@/components/fields/FormPhoneField";
import { FormSelectField } from "@/components/fields/FormSelectField";
import { FormTextField } from "@/components/fields/FormTextField";
import { Button } from "@/components/ui/Button";
import { genderOptions } from "@/components/layout/auth/authOptions";
import type { AuthResponse } from "@/types/auth";
import {
  emailValidation,
  noHtmlValidation,
  passwordValidation,
} from "@/utils/validation/formValidation";

type FacultyRegisterFormValues = {
  fullName: string;
  email: string;
  contactNumber: string;
  department: string;
  designation: string;
  gender: string;
  password: string;
  confirmPassword: string;
};

function getRedirectPath(user: AuthResponse["user"]) {
  if (user.role === "admin") {
    return "/admin";
  }

  return user.status === "active" ? "/dashboard" : "/pending";
}

export function FacultyRegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const {
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = useForm<FacultyRegisterFormValues>({
    defaultValues: {
      fullName: "",
      gender: "",
      email: "",
      contactNumber: "",
      department: "",
      designation: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });
  const onSubmit = async (values: FacultyRegisterFormValues) => {
    setFormError("");

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = (await response.json()) as Partial<AuthResponse> & {
      message?: string;
    };

    if (!response.ok) {
      setFormError(data.message ?? "Unable to register");
      return;
    }

    if (data.user) {
      router.push(getRedirectPath(data.user));
    }
  };

  return (
    <form
      className="grid gap-5 sm:grid-cols-2"
      method="post"
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
      <FormTextField
        control={control}
        name="email"
        label="Email address"
        type="email"
        placeholder="name@university.edu"
        rules={emailValidation}
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
      <FormTextField
        control={control}
        name="password"
        label="Password"
        type="password"
        placeholder="Create password"
        rules={passwordValidation}
      />
      <FormTextField
        control={control}
        name="confirmPassword"
        label="Confirm password"
        type="password"
        placeholder="Confirm password"
        rules={{
          required: "Confirm password is required",
          validate: (value) =>
            value === getValues("password") || "Passwords do not match",
        }}
      />

      <div className="sm:col-span-2">
        {formError ? (
          <p className="mb-4 text-sm font-medium text-danger">{formError}</p>
        ) : null}
        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
          loadingText="Registering"
        >
          Register
        </Button>
      </div>
    </form>
  );
}
