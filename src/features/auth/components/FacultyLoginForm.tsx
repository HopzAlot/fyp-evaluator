"use client";

import { useForm } from "react-hook-form";
import { TextField } from "@/components/fields/TextField";
import { Button } from "@/components/ui/Button";
import {
  facultyLoginValidation,
  type FacultyLoginFormValues,
} from "@/features/auth/validation/facultyLoginValidation";

export function FacultyLoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FacultyLoginFormValues>({
    mode: "onBlur",
  });

  const onSubmit = (values: FacultyLoginFormValues) => {
    console.log("Faculty login data", {
      ...values,
      password: "[hidden]",
    });
  };

  return (
    <form
      className="space-y-5"
      method="post"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextField
        label="Email address"
        type="email"
        placeholder="name@university.edu"
        error={errors.email?.message}
        {...register("email", facultyLoginValidation.email)}
      />
      <TextField
        label="Password"
        type="password"
        placeholder="Enter password"
        error={errors.password?.message}
        {...register("password", facultyLoginValidation.password)}
      />
      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  );
}
