"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormTextField } from "@/components/fields/FormTextField";
import { Button } from "@/components/ui/Button";
import {
  emailValidation,
  passwordValidation,
} from "@/utils/validation/formValidation";

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState("");
  const [showRegisteredMessage, setShowRegisteredMessage] = useState(
    searchParams.get("registered") === "1",
  );
  const registered = searchParams.get("registered") === "1";
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

  useEffect(() => {
    if (registered) {
      router.replace("/login");
    }
  }, [registered, router]);

  const onSubmit = async (values: LoginFormValues) => {
    setFormError("");
    setShowRegisteredMessage(false);

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = (await response.json()) as {
      message?: string;
    };

    if (!response.ok) {
      setFormError(data.message ?? "Unable to login");
      return;
    }

    router.push("/dashboard");
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
      {showRegisteredMessage && !formError && !isSubmitting ? (
        <p className="rounded-md border border-accent bg-accent-soft px-3 py-2 text-sm font-medium text-ink">
          Registration successful. Please login after admin approval.
        </p>
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
