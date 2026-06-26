// src/lib/types.ts
import { z } from "zod";
import type { ObjectId } from "mongodb";

export const WATCH_STATUSES = [
  "plan_to_watch",
  "watching",
  "completed",
] as const;

export type WatchStatus = (typeof WATCH_STATUSES)[number];

export const addShowSchema = z.object({
  tmdbId: z.number().int().positive(),
  status: z.enum(WATCH_STATUSES).default("plan_to_watch"),
});

export const updateShowSchema = z.object({
  id: z.string().min(1, "Show id is required"),
  status: z.enum(WATCH_STATUSES).optional(),
  rating: z.number().int().min(1).max(10).nullable().optional(),
  episodesWatched: z.number().int().min(0).optional(),
});

export const showIdSchema = z.object({
  id: z.string().min(1, "Show id is required"),
});

export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(120),
});

// How a show is stored in MongoDB
export interface ShowDocument {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  totalSeasons: number;
  totalEpisodes: number;
  episodesWatched: number;
  status: WatchStatus;
  rating: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// A stored show as it comes back from a query, including Mongo's _id
export interface ShowResponse extends ShowDocument {
  _id: ObjectId;
}

// How a show is sent to the browser. ObjectId and Date are not JSON-friendly, so this converts them to strings
export interface Show {
  id: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  totalSeasons: number;
  totalEpisodes: number;
  episodesWatched: number;
  status: WatchStatus;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
}

// Summary numbers for the stats bar
export interface LibraryStats {
  totalShows: number;
  episodesWatched: number;
  watching: number;
  completed: number;
  planToWatch: number;
}

export interface TmdbSearchResult {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  year: string | null;
  overview: string;
}

export interface TmdbShowDetails {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  totalSeasons: number;
  totalEpisodes: number;
}

export function documentToShow(doc: ShowResponse): Show {
  return {
    id: doc._id.toString(),
    tmdbId: doc.tmdbId,
    title: doc.title,
    posterPath: doc.posterPath,
    totalSeasons: doc.totalSeasons,
    totalEpisodes: doc.totalEpisodes,
    episodesWatched: doc.episodesWatched,
    status: doc.status,
    rating: doc.rating,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
