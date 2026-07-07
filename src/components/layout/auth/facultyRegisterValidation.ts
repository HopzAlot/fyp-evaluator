import type { RegisterOptions } from "react-hook-form";

export type FacultyRegisterFormValues = {
  fullName: string;
  facultyId: string;
  email: string;
  contactNumber: string;
  department: string;
  designation: string;
  gender: string;
  password: string;
};

type FacultyRegisterField = keyof FacultyRegisterFormValues;

export const facultyRegisterValidation: Record<
  FacultyRegisterField,
  RegisterOptions<FacultyRegisterFormValues>
> = {
  fullName: {
    required: "Full name is required",
    minLength: {
      value: 3,
      message: "Full name must be at least 3 characters",
    },
  },
  facultyId: {
    required: "Faculty ID is required",
  },
  email: {
    required: "Email address is required",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Enter a valid email address",
    },
  },
  contactNumber: {
    required: "Contact number is required",
    pattern: {
      value: /^03\d{2}\s?\d{7}$/,
      message: "Use a valid Pakistani mobile number",
    },
  },
  department: {
    required: "Department is required",
  },
  designation: {
    required: "Designation is required",
  },
  gender: {
    required: "Gender is required",
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
  },
};
