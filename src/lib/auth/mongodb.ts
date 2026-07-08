import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "fyp_evaluator";

if (!uri) {
  console.warn("MONGODB_URI is not set. Auth API routes will fail until it is configured.");
}

const globalMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

export function getMongoClient() {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!globalMongo.mongoClientPromise) {
    const client = new MongoClient(uri);
    globalMongo.mongoClientPromise = client.connect();
  }

  return globalMongo.mongoClientPromise;
}

export async function getDatabase() {
  const client = await getMongoClient();
  return client.db(dbName);
}
