import type { RegisterOptions } from "react-hook-form";

export type FacultyLoginFormValues = {
  email: string;
  password: string;
};

type FacultyLoginField = keyof FacultyLoginFormValues;

export const facultyLoginValidation: Record<
  FacultyLoginField,
  RegisterOptions<FacultyLoginFormValues>
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
  },
};
