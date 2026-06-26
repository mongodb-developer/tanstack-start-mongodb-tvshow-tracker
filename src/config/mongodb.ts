// src/config/mongodb.ts
export const DB_NAME = "episode-tracker";
export const COLLECTION_NAME = "shows";

export const MONGODB_CONNECTION_CONFIG = {
  minPoolSize: 1,
  maxIdleTimeMS: 60000,
} as const;
