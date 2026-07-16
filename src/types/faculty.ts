import type { AuthUser } from "@/types/auth";

export type AdminFacultyUser = Pick<
  AuthUser,
  | "id"
  | "email"
  | "status"
  | "fullName"
  | "contactNumber"
  | "department"
  | "designation"
  | "gender"
>;

export type RegisterFacultyRequest = {
  fullName: string;
  email: string;
  contactNumber: string;
  department: string;
  designation: string;
  gender: string;
  password: string;
  confirmPassword: string;
};

export type FacultyProfileRequest = {
  fullName: string;
  contactNumber: string;
  department: string;
  designation: string;
  gender: string;
};

export type FacultyPasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
