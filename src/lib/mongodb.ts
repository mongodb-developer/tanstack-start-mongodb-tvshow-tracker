// src/lib/mongodb.ts
import { MongoClient, type Collection, type Db } from "mongodb";
import {
  COLLECTION_NAME,
  DB_NAME,
  MONGODB_CONNECTION_CONFIG,
} from "../config/mongodb";
import type { ShowDocument } from "./types";

const MONGODB_URI = process.env.MONGODB_URI;

interface CachedConnection {
  client: MongoClient | null;
  db: Db | null;
  promise: Promise<{ client: MongoClient; db: Db }> | null;
}

const cached: CachedConnection = {
  client: null,
  db: null,
  promise: null,
};

export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  if (cached.client && cached.db) {
    return { client: cached.client, db: cached.db };
  }

  if (cached.promise) {
    return cached.promise;
  }

  if (!MONGODB_URI) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Add it to your .env file."
    );
  }

  cached.promise = MongoClient.connect(MONGODB_URI, {
    appName: "devrel-github-tanstack-tvshow-tracker",
    ...MONGODB_CONNECTION_CONFIG,
  })
    .then((client) => {
      const db = client.db(DB_NAME);

      cached.client = client;
      cached.db = db;
      cached.promise = null;

      return { client, db };
    })
    .catch((error) => {
      cached.promise = null;
      throw error;
    });

  return cached.promise;
}

export async function getShowsCollection(): Promise<Collection<ShowDocument>> {
  const { db } = await connectToDatabase();
  const collection = db.collection<ShowDocument>(COLLECTION_NAME);
  await collection.createIndex({ tmdbId: 1 }, { unique: true });
  return collection;
}
