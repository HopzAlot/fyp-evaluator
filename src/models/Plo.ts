import {
  Schema,
  model,
  models,
  type HydratedDocument,
  type Model,
} from "mongoose";

type Plo = {
  code: string;
  order: number;
  title: string;
  description: string;
};

export type PloDocument = HydratedDocument<Plo>;

const PloSchema = new Schema<Plo>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    collection: "plos",
    versionKey: false,
  },
);

export const PloModel =
  (models.Plo as Model<Plo> | undefined) ?? model<Plo>("Plo", PloSchema);
