import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "fyp_evaluator";

if (!uri) {
  console.warn(
    "MONGODB_URI is not set. Auth API routes will fail until it is configured.",
  );
}

const globalMongoose = globalThis as typeof globalThis & {
  mongooseConnection?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

if (!globalMongoose.mongooseConnection) {
  globalMongoose.mongooseConnection = {
    conn: null,
    promise: null,
  };
}

export async function connectDatabase() {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (globalMongoose.mongooseConnection?.conn) {
    return globalMongoose.mongooseConnection.conn;
  }

  if (!globalMongoose.mongooseConnection?.promise) {
    globalMongoose.mongooseConnection!.promise = mongoose.connect(uri, {
      dbName,
    });
  }

  globalMongoose.mongooseConnection!.conn =
    await globalMongoose.mongooseConnection!.promise;

  return globalMongoose.mongooseConnection!.conn;
}
