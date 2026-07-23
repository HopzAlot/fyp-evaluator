import {
  Schema,
  model,
  models,
  type HydratedDocument,
  type Model,
} from "mongoose";
import type { ProjectStatus } from "@/types/project";

type Project = {
  projectKey: string;
  title: string;
  students: string[];
  studentIds: string[];
  supervisor: string;
  coSupervisor: string;
  industrialPartner: string;
  sdg: string;
  status: ProjectStatus;
  deletionPending: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectDocument = HydratedDocument<Project>;

const ProjectSchema = new Schema<Project>(
  {
    projectKey: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      trim: true,
    },
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
    studentIds: {
      type: [String],
      default: [],
      validate: {
        validator: (studentIds: string[]) => studentIds.length <= 4,
        message: "A project can have at most 4 student ids",
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
      enum: ["in progress", "completed"],
      default: "in progress",
      required: true,
    },
    deletionPending: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    collection: "projects",
    timestamps: true,
    versionKey: false,
  },
);

export const ProjectModel =
  (models.Project as Model<Project> | undefined) ??
  model<Project>("Project", ProjectSchema);
