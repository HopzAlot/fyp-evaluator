import {
  Schema,
  model,
  models,
  type HydratedDocument,
  type Model,
} from "mongoose";
import type { AdminProjectStatus } from "@/types/project";

type Project = {
  title: string;
  students: string[];
  supervisor: string;
  coSupervisor: string;
  industrialPartner: string;
  sdg: string;
  status: AdminProjectStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectDocument = HydratedDocument<Project>;

const ProjectSchema = new Schema<Project>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    students: {
      type: [String],
      default: [],
      validate: {
        validator: (students: string[]) => students.length <= 4,
        message: "A project can have at most 4 students",
      },
    },
    supervisor: {
      type: String,
      required: true,
      trim: true,
    },
    coSupervisor: {
      type: String,
      default: "",
      trim: true,
    },
    industrialPartner: {
      type: String,
      default: "",
      trim: true,
    },
    sdg: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "under-review", "accepted", "rejected"],
      default: "pending",
      required: true,
    },
  },
  {
    collection: "projects",
    timestamps: true,
  },
);

export const ProjectModel =
  (models.Project as Model<Project> | undefined) ??
  model<Project>("Project", ProjectSchema);
