import {
  Schema,
  model,
  models,
  type HydratedDocument,
  type Model,
} from "mongoose";
import type { UserRole, UserStatus } from "@/types/auth";

type User = {
  email: string;
  name: string;
  gender: string;
  role: UserRole;
  status: UserStatus;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserDocument = HydratedDocument<User>;

const UserSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "prefer-not-to-say", ""],
      default: "",
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "faculty"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    collection: "users",
    timestamps: true,
    versionKey: false,
  },
);

export const UserModel =
  (models.User as Model<User> | undefined) ?? model<User>("User", UserSchema);
