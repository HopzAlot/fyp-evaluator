"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/fields/TextField";
import { Button } from "@/components/ui/Button";
import {
  facultyLoginValidation,
  type FacultyLoginFormValues,
} from "@/features/auth/validation/facultyLoginValidation";

export function FacultyLoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FacultyLoginFormValues>({
    mode: "onBlur",
  });

  const onSubmit = (values: FacultyLoginFormValues) => {
    console.log("Faculty login data", values);
  };

  return (
    <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">Faculty Portal</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Login to your account
        </h1>
      </div>

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

      <p className="mt-6 text-center text-sm text-slate-600">
        New faculty member?{" "}
        <Link
          href="/faculty/register"
          className="font-semibold text-slate-950 hover:underline"
        >
          Register
        </Link>
      </p>
    </section>
  );
}
