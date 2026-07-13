import {
  Schema,
  Types,
  model,
  models,
  type HydratedDocument,
  type Model,
} from "mongoose";

type Faculty = {
  userId: Types.ObjectId;
  fullName: string;
  contactNumber: string;
  department: string;
  designation: string;
  gender: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FacultyDocument = HydratedDocument<Faculty>;

const FacultySchema = new Schema<Faculty>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "prefer-not-to-say"],
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    collection: "faculty",
    timestamps: true,
  },
);

export const FacultyModel =
  (models.Faculty as Model<Faculty> | undefined) ??
  model<Faculty>("Faculty", FacultySchema);
