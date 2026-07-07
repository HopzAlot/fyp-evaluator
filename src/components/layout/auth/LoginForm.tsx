"use client";

import { useForm } from "react-hook-form";
import { TextField } from "@/components/main/fields/TextField";
import { Button } from "@/components/main/ui/Button";
import {
  loginValidation,
  type LoginFormValues,
} from "@/components/layout/auth/loginValidation";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    mode: "onChange",
  });

  const onSubmit = (values: LoginFormValues) => {
    console.log("Login data", {
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
        placeholder="Enter your email"
        error={errors.email?.message}
        {...register("email", loginValidation.email)}
      />
      <TextField
        label="Password"
        type="password"
        placeholder="Enter password"
        error={errors.password?.message}
        {...register("password", loginValidation.password)}
      />
      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  );
}
