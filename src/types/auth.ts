export type UserRole = "admin" | "faculty";
export type UserStatus = "active" | "inactive";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  fullName?: string;
  contactNumber?: string;
  department?: string;
  designation?: string;
  gender?: string;
};

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

export type FacultyProfileRequest = {
  fullName: string;
  contactNumber: string;
  department: string;
  designation: string;
  gender: string;
};

export type AuthResponse = {
  user: AuthUser;
};
