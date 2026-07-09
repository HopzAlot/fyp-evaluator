import { ObjectId, type Collection, type OptionalId } from "mongodb";
import { getDatabase } from "@/lib/db/mongodb";
import type { RegisterFacultyRequest } from "@/types/auth";

export type FacultyDocument = {
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

async function getFacultiesCollection(): Promise<Collection<FacultyDocument>> {
  const database = await getDatabase();
  const collection = database.collection<FacultyDocument>("faculties");
  await collection.createIndex({ userId: 1 }, { unique: true });
  return collection;
}

export async function createFacultyProfile(
  userId: ObjectId,
  values: RegisterFacultyRequest,
) {
  const faculties = await getFacultiesCollection();
  const now = new Date();
  const faculty: OptionalId<FacultyDocument> = {
    userId,
    fullName: values.fullName.trim(),
    contactNumber: values.contactNumber.trim(),
    department: values.department.trim(),
    designation: values.designation.trim(),
    gender: values.gender,
    createdAt: now,
    updatedAt: now,
  };

  const result = await faculties.insertOne(faculty as FacultyDocument);

  return { ...faculty, _id: result.insertedId } as FacultyDocument;
}

export async function getFacultyByUserId(userId: ObjectId) {
  const faculties = await getFacultiesCollection();
  return faculties.findOne({ userId });
}
