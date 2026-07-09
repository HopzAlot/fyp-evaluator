"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormTextField } from "@/components/fields/FormTextField";
import { Button } from "@/components/ui/Button";
import type { AuthResponse } from "@/types/auth";
import {
  emailValidation,
  passwordValidation,
} from "@/utils/validation/formValidation";

type LoginFormValues = {
  email: string;
  password: string;
};

function getRedirectPath(user: AuthResponse["user"]) {
  if (user.role === "admin") {
    return "/admin";
  }

  return user.status === "active" ? "/dashboard" : "/pending";
}

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError("");

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = (await response.json()) as Partial<AuthResponse> & {
      message?: string;
    };

    if (!response.ok) {
      setFormError(data.message ?? "Unable to login");
      return;
    }

    if (data.user) {
      router.push(getRedirectPath(data.user));
    }
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
      {formError ? (
        <p className="text-sm font-medium text-danger">{formError}</p>
      ) : null}
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
