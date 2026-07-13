import bcrypt from "bcryptjs";
import { isValidObjectId, type Types } from "mongoose";
import { connectDatabase } from "@/lib/db/mongoose";
import { UserModel, type UserDocument } from "@/models/User";
import type { AuthUser, UserRole, UserStatus } from "@/types/auth";
import type { FacultyDocument } from "./facultyService";

type CreateUserAccountValues = {
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};

export async function createUserAccount(values: CreateUserAccountValues) {
  await connectDatabase();
  const email = values.email.toLowerCase().trim();
  const existingUser = await UserModel.exists({ email });

  if (existingUser) {
    return null;
  }

  return UserModel.create({
    email,
    role: values.role,
    status: values.status,
    passwordHash: await bcrypt.hash(values.password, 12),
  });
}

export async function deleteUserAccount(userId: Types.ObjectId) {
  await connectDatabase();
  await UserModel.deleteOne({ _id: userId });
}

export async function authenticateUser(email: string, password: string) {
  await connectDatabase();
  const user = await UserModel.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  return passwordMatches ? user : null;
}

export async function getUserById(userId: string) {
  if (!isValidObjectId(userId)) {
    return null;
  }

  await connectDatabase();
  return UserModel.findById(userId);
}

export function toAuthUser(
  user: UserDocument,
  faculty?: FacultyDocument | null,
): AuthUser {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    status: user.status,
    fullName: faculty?.fullName,
    contactNumber: faculty?.contactNumber,
    department: faculty?.department,
    designation: faculty?.designation,
    gender: faculty?.gender,
  };
}
