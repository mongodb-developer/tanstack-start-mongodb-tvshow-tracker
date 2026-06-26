// src/server/tmdb.ts
import { createServerFn } from "@tanstack/react-start";
import { searchSchema, type TmdbSearchResult } from "~/lib/types";
import { searchShows } from "~/lib/tmdb";

export const searchTmdb = createServerFn({ method: "GET" })
  .validator(searchSchema)
  .handler(async ({ data }): Promise<TmdbSearchResult[]> => {
    try {
      return await searchShows(data.query);
    } catch (error) {
      console.error("TMDB search failed:", error);
      throw new Error("Failed to search TMDB");
    }
  });
