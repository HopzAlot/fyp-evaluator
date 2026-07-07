"use client";

import { useForm } from "react-hook-form";
import { FormTextField } from "@/components/main/fields/FormTextField";
import { Button } from "@/components/main/ui/Button";
import {
  emailValidation,
  passwordValidation,
} from "@/utils/validation/formValidation";

type LoginFormValues = {
  email: string;
  password: string;
};

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
        rules={emailValidation}
      />
      <FormTextField
        control={control}
        name="password"
        label="Password"
        type="password"
        placeholder="Enter password"
        rules={passwordValidation}
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
