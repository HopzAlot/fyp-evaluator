"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { SelectField } from "@/components/fields/SelectField";
import { TextField } from "@/components/fields/TextField";
import { Button } from "@/components/ui/Button";
import {
  departmentOptions,
  designationOptions,
  genderOptions,
} from "@/features/auth/constants/facultyOptions";
import {
  facultyRegisterValidation,
  type FacultyRegisterFormValues,
} from "@/features/auth/validation/facultyRegisterValidation";

export function FacultyRegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FacultyRegisterFormValues>({
    mode: "onBlur",
  });

  const onSubmit = (values: FacultyRegisterFormValues) => {
    console.log("Faculty register data", values);
  };

  return (
    <section className="w-full max-w-3xl rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-semibold text-accent">Faculty Portal</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Create faculty account
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Add your profile details to start using the evaluator workspace.
        </p>
      </div>

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
        <TextField
          label="Faculty ID"
          placeholder="Enter faculty ID"
          error={errors.facultyId?.message}
          {...register("facultyId", facultyRegisterValidation.facultyId)}
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
          {...register(
            "contactNumber",
            facultyRegisterValidation.contactNumber,
          )}
        />
        <SelectField
          label="Department"
          options={departmentOptions}
          error={errors.department?.message}
          {...register("department", facultyRegisterValidation.department)}
        />
        <SelectField
          label="Designation"
          options={designationOptions}
          error={errors.designation?.message}
          {...register("designation", facultyRegisterValidation.designation)}
        />
        <SelectField
          label="Gender"
          options={genderOptions}
          error={errors.gender?.message}
          {...register("gender", facultyRegisterValidation.gender)}
        />
        <TextField
          label="Password"
          type="password"
          placeholder="Create password"
          error={errors.password?.message}
          {...register("password", facultyRegisterValidation.password)}
        />

        <div className="sm:col-span-2">
          <Button type="submit" className="w-full">
            Register
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already registered?{" "}
        <Link
          href="/faculty/login"
          className="font-semibold text-primary hover:underline"
        >
          Login
        </Link>
      </p>
    </section>
  );
}
