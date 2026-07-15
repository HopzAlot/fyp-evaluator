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

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: AuthUser;
};
