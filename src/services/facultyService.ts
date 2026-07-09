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

async function getFacultyCollection(): Promise<Collection<FacultyDocument>> {
  const database = await getDatabase();
  const collection = database.collection<FacultyDocument>("faculty");
  await collection.createIndex({ userId: 1 }, { unique: true });
  return collection;
}

export async function createFacultyProfile(
  userId: ObjectId,
  values: RegisterFacultyRequest,
) {
  const facultyCollection = await getFacultyCollection();
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

  const result = await facultyCollection.insertOne(faculty as FacultyDocument);

  return { ...faculty, _id: result.insertedId } as FacultyDocument;
}

export async function getFacultyByUserId(userId: ObjectId) {
  const facultyCollection = await getFacultyCollection();
  return facultyCollection.findOne({ userId });
}
