import bcrypt from "bcryptjs";
import { ObjectId, type Collection, type OptionalId } from "mongodb";
import { getDatabase } from "@/lib/db/mongodb";
import type { AuthUser, UserRole, UserStatus } from "@/types/auth";
import type { FacultyDocument } from "./facultyService";

export type UserDocument = {
  _id: ObjectId;
  email: string;
  role: UserRole;
  status: UserStatus;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

type CreateUserAccountValues = {
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};

async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const database = await getDatabase();
  const collection = database.collection<UserDocument>("users");
  await collection.createIndex({ email: 1 }, { unique: true });
  return collection;
}

export async function createUserAccount(values: CreateUserAccountValues) {
  const users = await getUsersCollection();
  const email = values.email.toLowerCase().trim();
  const existingUser = await users.findOne({ email });

  if (existingUser) {
    return null;
  }

  const now = new Date();
  const user: OptionalId<UserDocument> = {
    email,
    role: values.role,
    status: values.status,
    passwordHash: await bcrypt.hash(values.password, 12),
    createdAt: now,
    updatedAt: now,
  };

  const result = await users.insertOne(user as UserDocument);

  return { ...user, _id: result.insertedId } as UserDocument;
}

export async function deleteUserAccount(userId: ObjectId) {
  const users = await getUsersCollection();
  await users.deleteOne({ _id: userId });
}

export async function authenticateUser(email: string, password: string) {
  const users = await getUsersCollection();
  const user = await users.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  return passwordMatches ? user : null;
}

export async function getUserById(userId: string) {
  if (!ObjectId.isValid(userId)) {
    return null;
  }

  const users = await getUsersCollection();
  return users.findOne({ _id: new ObjectId(userId) });
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
