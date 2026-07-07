"use client";

import { useForm } from "react-hook-form";
import { FormSelectField } from "@/components/main/fields/FormSelectField";
import { FormTextField } from "@/components/main/fields/FormTextField";
import { Button } from "@/components/main/ui/Button";
import { genderOptions } from "@/components/layout/auth/authOptions";
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

export function FacultyRegisterForm() {
  const {
    control,
    handleSubmit,
    getValues,
    reset,
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
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Faculty register data", {
      ...values,
      password: "[hidden]",
      confirmPassword: "[hidden]",
    });
    reset();
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
      <FormTextField
        control={control}
        name="contactNumber"
        label="Contact number"
        type="tel"
        placeholder="03XX XXXXXXX"
        rules={{
          required: "Contact number is required",
          pattern: {
            value: /^03\d{2}\s?\d{7}$/,
            message: "Use a valid Pakistani mobile number",
          },
          validate: noHtmlValidation,
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
