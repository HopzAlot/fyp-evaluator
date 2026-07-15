import bcrypt from "bcryptjs";
import { isValidObjectId, type Types } from "mongoose";
import { connectDatabase } from "@/lib/db/mongoose";
import { UserModel, type UserDocument } from "@/models/User";
import type { AuthUser, UserRole, UserStatus } from "@/types/auth";
import type { AdminFacultyUser } from "@/types/faculty";
import {
  normalizeGender,
  normalizeText,
} from "@/utils/normalization/facultyNormalization";
import {
  getFacultyProfilesByUserIds,
  type FacultyDocument,
} from "./facultyService";

type CreateUserAccountValues = {
  email: string;
  password: string;
  fullName?: string;
  gender?: string;
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
    fullName: values.fullName ? normalizeText(values.fullName) : "",
    gender: values.gender ? normalizeGender(values.gender) : "",
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

export async function getFacultyUsers() {
  await connectDatabase();
  return UserModel.find({ role: "faculty" }).sort({ createdAt: -1 });
}

export async function getAdminFacultyUsers(): Promise<AdminFacultyUser[]> {
  const users = await getFacultyUsers();
  const profiles = await getFacultyProfilesByUserIds(
    users.map((user) => user._id),
  );
  const profileByUserId = new Map(
    profiles.map((profile) => [profile.userId.toString(), profile]),
  );

  return users.map((user) => {
    const profile = profileByUserId.get(user._id.toString());

    return {
      id: user._id.toString(),
      email: user.email,
      status: user.status,
      fullName: profile?.fullName ?? user.fullName,
      contactNumber: profile?.contactNumber,
      department: profile?.department,
      designation: profile?.designation,
      gender: profile?.gender ?? user.gender,
    };
  });
}

export async function getAdminFacultyUserById(userId: string) {
  const user = await getUserById(userId);

  if (!user || user.role !== "faculty") {
    return null;
  }

  const profile = await getFacultyProfilesByUserIds([user._id]);
  const faculty = profile[0];

  return {
    id: user._id.toString(),
    email: user.email,
    status: user.status,
    fullName: faculty?.fullName ?? user.fullName,
    contactNumber: faculty?.contactNumber,
    department: faculty?.department,
    designation: faculty?.designation,
    gender: faculty?.gender ?? user.gender,
  } satisfies AdminFacultyUser;
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  if (!isValidObjectId(userId)) {
    return null;
  }

  await connectDatabase();
  return UserModel.findOneAndUpdate(
    { _id: userId, role: "faculty" },
    { status },
    { new: true },
  );
}

export async function updateUserProfileFields(
  userId: string,
  values: Pick<AuthUser, "fullName" | "gender">,
) {
  if (!isValidObjectId(userId)) {
    return null;
  }

  await connectDatabase();
  return UserModel.findByIdAndUpdate(
    userId,
    {
      fullName: values.fullName ? normalizeText(values.fullName) : "",
      gender: values.gender ? normalizeGender(values.gender) : "",
    },
    { new: true },
  );
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
    fullName: faculty?.fullName ?? user.fullName,
    contactNumber: faculty?.contactNumber,
    department: faculty?.department,
    designation: faculty?.designation,
    gender: faculty?.gender ?? user.gender,
  };
}
