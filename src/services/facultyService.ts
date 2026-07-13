import type { Types } from "mongoose";
import { connectDatabase } from "@/lib/db/mongoose";
import { FacultyModel } from "@/models/Faculty";
import type { RegisterFacultyRequest } from "@/types/auth";
import {
  normalizeGender,
  normalizeText,
} from "@/utils/normalization/facultyNormalization";

export type { FacultyDocument } from "@/models/Faculty";

export async function createFacultyProfile(
  userId: Types.ObjectId,
  values: RegisterFacultyRequest,
) {
  await connectDatabase();

  return FacultyModel.create({
    userId,
    fullName: normalizeText(values.fullName),
    contactNumber: normalizeText(values.contactNumber),
    department: normalizeText(values.department),
    designation: normalizeText(values.designation),
    gender: normalizeGender(values.gender),
  });
}

export async function getFacultyByUserId(userId: Types.ObjectId) {
  await connectDatabase();
  return FacultyModel.findOne({ userId });
}
