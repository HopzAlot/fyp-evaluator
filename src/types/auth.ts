export type UserRole = "admin" | "faculty";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  contactNumber?: string;
  department?: string;
  designation?: string;
  gender?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

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

export type AuthResponse = {
  user: AuthUser;
};
