import type { WatchStatus } from "./types";

// TMDB serves poster images from a few fixed sizes. w342 looks crisp on cards.
export const TMDB_POSTER_BASE = "https://image.tmdb.org/t/p/w342";

export const STATUS_LABELS: Record<WatchStatus, string> = {
  plan_to_watch: "Plan to watch",
  watching: "Watching",
  completed: "Completed",
};
