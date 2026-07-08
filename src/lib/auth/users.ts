import bcrypt from "bcryptjs";
import { ObjectId, type Collection, type OptionalId } from "mongodb";
import { getDatabase } from "@/lib/auth/mongodb";
import type {
  AuthUser,
  RegisterFacultyRequest,
  UserRole,
  UserStatus,
} from "@/types/auth";

type UserDocument = {
  _id: ObjectId;
  email: string;
  role: UserRole;
  status: UserStatus;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

type FacultyDocument = {
  _id: ObjectId;
  userId: ObjectId;
  fullName: string;
  contactNumber: string;
  department: string;
  designation: string;
  gender: string;
  createdAt: Date;
  updatedAt: Date;
};

async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const database = await getDatabase();
  const collection = database.collection<UserDocument>("users");
  await collection.createIndex({ email: 1 }, { unique: true });
  return collection;
}

async function getFacultiesCollection(): Promise<Collection<FacultyDocument>> {
  const database = await getDatabase();
  const collection = database.collection<FacultyDocument>("faculties");
  await collection.createIndex({ userId: 1 }, { unique: true });
  return collection;
}

export async function createFacultyUser(values: RegisterFacultyRequest) {
  const users = await getUsersCollection();
  const faculties = await getFacultiesCollection();
  const email = values.email.toLowerCase().trim();
  const existingUser = await users.findOne({ email });

  if (existingUser) {
    return null;
  }

  const now = new Date();
  const user: OptionalId<UserDocument> = {
    email,
    role: "faculty",
    status: "inactive",
    passwordHash: await bcrypt.hash(values.password, 12),
    createdAt: now,
    updatedAt: now,
  };

  const userResult = await users.insertOne(user as UserDocument);
  const faculty: OptionalId<FacultyDocument> = {
    userId: userResult.insertedId,
    fullName: values.fullName.trim(),
    contactNumber: values.contactNumber.trim(),
    department: values.department.trim(),
    designation: values.designation.trim(),
    gender: values.gender,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const facultyResult = await faculties.insertOne(faculty as FacultyDocument);

    return toPublicUser(
      { ...user, _id: userResult.insertedId } as UserDocument,
      { ...faculty, _id: facultyResult.insertedId } as FacultyDocument,
    );
  } catch (error) {
    await users.deleteOne({ _id: userResult.insertedId });
    throw error;
  }
}

export async function authenticateUser(email: string, password: string) {
  const users = await getUsersCollection();
  const user = await users.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return null;
  }

  return hydratePublicUser(user);
}

export async function getUserById(userId: string) {
  if (!ObjectId.isValid(userId)) {
    return null;
  }

  const users = await getUsersCollection();
  const user = await users.findOne({ _id: new ObjectId(userId) });

  return user ? hydratePublicUser(user) : null;
}

async function hydratePublicUser(user: UserDocument) {
  if (user.role !== "faculty") {
    return toPublicUser(user);
  }

  const faculties = await getFacultiesCollection();
  const faculty = await faculties.findOne({ userId: user._id });

  return toPublicUser(user, faculty ?? undefined);
}

function toPublicUser(user: UserDocument, faculty?: FacultyDocument): AuthUser {
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
