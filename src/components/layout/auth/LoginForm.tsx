"use client";

import { useForm } from "react-hook-form";
import { FormTextField } from "@/components/main/fields/FormTextField";
import { Button } from "@/components/main/ui/Button";
import {
  loginValidation,
  type LoginFormValues,
} from "@/components/layout/auth/loginValidation";

export function LoginForm() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: LoginFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Login data", {
      ...values,
      password: "[hidden]",
    });
    reset();
  };

  return (
    <form
      className="space-y-5"
      method="post"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormTextField
        control={control}
        name="email"
        label="Email address"
        type="email"
        placeholder="Enter your email"
        rules={loginValidation.email}
      />
      <FormTextField
        control={control}
        name="password"
        label="Password"
        type="password"
        placeholder="Enter password"
        rules={loginValidation.password}
      />
      <Button
        type="submit"
        className="w-full"
        loading={isSubmitting}
        loadingText="Logging in"
      >
        Login
      </Button>
    </form>
  );
}
