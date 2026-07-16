import type { LoginRequest } from "@/types/auth";
import type {
  FacultyPasswordRequest,
  FacultyProfileRequest,
  RegisterFacultyRequest,
} from "@/types/faculty";
import {
  isGenderValue,
  normalizeGender,
} from "@/utils/normalization/facultyNormalization";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const htmlPattern = /<[^>]*>|&lt;|&gt;|javascript:/i;

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function hasHtml(value: string) {
  return htmlPattern.test(value);
}

export function validateLoginPayload(payload: unknown) {
  const values = payload as Partial<LoginRequest>;

  if (!isString(values.email) || !emailPattern.test(values.email)) {
    return "Enter a valid email address";
  }

  if (!isString(values.password) || values.password.length < 8) {
    return "Password must be at least 8 characters";
  }

  return null;
}

export function validateFacultyRegisterPayload(payload: unknown) {
  const values = payload as Partial<RegisterFacultyRequest>;
  const requiredFields: Array<keyof RegisterFacultyRequest> = [
    "fullName",
    "email",
    "contactNumber",
    "department",
    "designation",
    "gender",
    "password",
    "confirmPassword",
  ];

  for (const field of requiredFields) {
    if (!isString(values[field]) || !values[field]?.trim()) {
      return `${field} is required`;
    }
  }

  const textFields = [
    values.fullName,
    values.contactNumber,
    values.department,
    values.designation,
    values.gender,
  ];

  if (textFields.some((value) => hasHtml(value ?? ""))) {
    return "HTML is not allowed";
  }

  if (!emailPattern.test(values.email ?? "")) {
    return "Enter a valid email address";
  }

  if (!isGenderValue(normalizeGender(values.gender ?? ""))) {
    return "Select a valid gender";
  }

  if ((values.password?.length ?? 0) < 8) {
    return "Password must be at least 8 characters";
  }

  if (values.password !== values.confirmPassword) {
    return "Passwords do not match";
  }

  return null;
}

export function validateFacultyProfilePayload(payload: unknown) {
  const values = payload as Partial<FacultyProfileRequest>;
  const requiredFields: Array<keyof FacultyProfileRequest> = [
    "fullName",
    "contactNumber",
    "department",
    "designation",
    "gender",
  ];

  for (const field of requiredFields) {
    if (!isString(values[field]) || !values[field]?.trim()) {
      return `${field} is required`;
    }
  }

  const textFields = [
    values.fullName,
    values.contactNumber,
    values.department,
    values.designation,
    values.gender,
  ];

  if (textFields.some((value) => hasHtml(value ?? ""))) {
    return "HTML is not allowed";
  }

  if (!isGenderValue(normalizeGender(values.gender ?? ""))) {
    return "Select a valid gender";
  }

  return null;
}

export function validateFacultyPasswordPayload(payload: unknown) {
  const values = payload as Partial<FacultyPasswordRequest>;

  if (!isString(values.currentPassword) || !values.currentPassword.trim()) {
    return "Current password is required";
  }

  if (!isString(values.newPassword) || values.newPassword.length < 8) {
    return "New password must be at least 8 characters";
  }

  if (values.newPassword !== values.confirmPassword) {
    return "Passwords do not match";
  }

  if (values.currentPassword === values.newPassword) {
    return "New password must be different from current password";
  }

  return null;
}
