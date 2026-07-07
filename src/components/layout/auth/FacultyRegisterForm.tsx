"use client";

import { useForm } from "react-hook-form";
import { SelectField } from "@/components/main/fields/SelectField";
import { TextField } from "@/components/main/fields/TextField";
import { Button } from "@/components/main/ui/Button";
import { genderOptions } from "@/components/layout/auth/authOptions";
import {
  facultyRegisterValidation,
  type FacultyRegisterFormValues,
} from "@/components/layout/auth/facultyRegisterValidation";

export function FacultyRegisterForm() {
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FacultyRegisterFormValues>({
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
      <TextField
        label="Full name"
        placeholder="Enter name"
        error={errors.fullName?.message}
        {...register("fullName", facultyRegisterValidation.fullName)}
      />
      <SelectField
        label="Gender"
        options={genderOptions}
        error={errors.gender?.message}
        {...register("gender", facultyRegisterValidation.gender)}
      />
      <TextField
        label="Email address"
        type="email"
        placeholder="name@university.edu"
        error={errors.email?.message}
        {...register("email", facultyRegisterValidation.email)}
      />
      <TextField
        label="Contact number"
        type="tel"
        placeholder="03XX XXXXXXX"
        error={errors.contactNumber?.message}
        {...register("contactNumber", facultyRegisterValidation.contactNumber)}
      />
      <TextField
        label="Department"
        placeholder="Enter department"
        error={errors.department?.message}
        {...register("department", facultyRegisterValidation.department)}
      />
      <TextField
        label="Designation"
        placeholder="Enter designation"
        error={errors.designation?.message}
        {...register("designation", facultyRegisterValidation.designation)}
      />
      <TextField
        label="Password"
        type="password"
        placeholder="Create password"
        error={errors.password?.message}
        {...register("password", facultyRegisterValidation.password)}
      />
      <TextField
        label="Confirm password"
        type="password"
        placeholder="Confirm password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword", {
          ...facultyRegisterValidation.confirmPassword,
          validate: (value) =>
            value === getValues("password") || "Passwords do not match",
        })}
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
