"use client";

import { useForm } from "react-hook-form";
import { SelectField } from "@/components/fields/SelectField";
import { TextField } from "@/components/fields/TextField";
import { Button } from "@/components/ui/Button";
import { genderOptions } from "@/features/auth/constants/authoptions";
import {
  facultyRegisterValidation,
  type FacultyRegisterFormValues,
} from "@/features/auth/validation/facultyRegisterValidation";

export function FacultyRegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FacultyRegisterFormValues>({
    mode: "onChange",
  });

  const onSubmit = (values: FacultyRegisterFormValues) => {
    console.log("Faculty register data", {
      ...values,
      password: "[hidden]",
    });
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
  );
}
