import type { RegisterOptions } from "react-hook-form";

export type LoginFormValues = {
  email: string;
  password: string;
};

type LoginField = keyof LoginFormValues;

export const loginValidation: Record<
  LoginField,
  RegisterOptions<LoginFormValues>
> = {
  email: {
    required: "Email address is required",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Enter a valid email address",
    },
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
  },
};
