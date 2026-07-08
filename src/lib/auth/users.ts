import bcrypt from "bcryptjs";
import { ObjectId, type Collection, type OptionalId } from "mongodb";
import { getDatabase } from "@/lib/auth/mongodb";
import type { AuthUser, RegisterFacultyRequest, UserRole } from "@/types/auth";

type UserDocument = {
  _id: ObjectId;
  email: string;
  fullName: string;
  role: UserRole;
  passwordHash: string;
  contactNumber?: string;
  department?: string;
  designation?: string;
  gender?: string;
  createdAt: Date;
  updatedAt: Date;
};

async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const database = await getDatabase();
  const collection = database.collection<UserDocument>("users");
  await collection.createIndex({ email: 1 }, { unique: true });
  return collection;
}

export async function createFacultyUser(values: RegisterFacultyRequest) {
  const users = await getUsersCollection();
  const email = values.email.toLowerCase().trim();
  const existingUser = await users.findOne({ email });

  if (existingUser) {
    return null;
  }

  const now = new Date();
  const user: OptionalId<UserDocument> = {
    email,
    fullName: values.fullName.trim(),
    role: "faculty",
    contactNumber: values.contactNumber.trim(),
    department: values.department.trim(),
    designation: values.designation.trim(),
    gender: values.gender,
    passwordHash: await bcrypt.hash(values.password, 12),
    createdAt: now,
    updatedAt: now,
  };

  const result = await users.insertOne(user as UserDocument);

  return toPublicUser({
    ...user,
    _id: result.insertedId,
  } as UserDocument);
}

export async function authenticateUser(email: string, password: string) {
  const users = await getUsersCollection();
  const user = await users.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  return passwordMatches ? toPublicUser(user) : null;
}

export async function getUserById(userId: string) {
  if (!ObjectId.isValid(userId)) {
    return null;
  }

  const users = await getUsersCollection();
  const user = await users.findOne({ _id: new ObjectId(userId) });

  return user ? toPublicUser(user) : null;
}

function toPublicUser(user: UserDocument): AuthUser {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    contactNumber: user.contactNumber,
    department: user.department,
    designation: user.designation,
    gender: user.gender,
  };
}
