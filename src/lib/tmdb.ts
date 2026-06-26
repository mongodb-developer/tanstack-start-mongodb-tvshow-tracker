import type { TmdbSearchResult, TmdbShowDetails } from "./types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;

// Small wrapper around the TMDB REST API
async function tmdbFetch<T>(path: string): Promise<T> {
  if (!TMDB_TOKEN) {
    throw new Error(
      "Missing TMDB_READ_ACCESS_TOKEN environment variable. Add it to your .env file."
    );
  }

  const res = await fetch(`${TMDB_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
      accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`TMDB request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

interface TmdbSearchResponse {
  results: Array<{
    id: number;
    name: string;
    poster_path: string | null;
    first_air_date?: string;
    overview?: string;
  }>;
}

interface TmdbDetailsResponse {
  id: number;
  name: string;
  poster_path: string | null;
  number_of_seasons: number;
  number_of_episodes: number;
}

// Search TV shows by title. Returns a trimmed list shaped for the UI
export async function searchShows(query: string): Promise<TmdbSearchResult[]> {
  const data = await tmdbFetch<TmdbSearchResponse>(
    `/search/tv?query=${encodeURIComponent(query)}&include_adult=false&page=1`
  );

  return (data.results ?? []).slice(0, 8).map((show) => ({
    tmdbId: show.id,
    title: show.name,
    posterPath: show.poster_path,
    year: show.first_air_date ? show.first_air_date.slice(0, 4) : null,
    overview: show.overview ?? "",
  }));
}

//Fetch the season and episode counts for a single show
export async function getShowDetails(tmdbId: number): Promise<TmdbShowDetails> {
  const data = await tmdbFetch<TmdbDetailsResponse>(`/tv/${tmdbId}`);

  return {
    tmdbId: data.id,
    title: data.name,
    posterPath: data.poster_path,
    totalSeasons: data.number_of_seasons ?? 0,
    totalEpisodes: data.number_of_episodes ?? 0,
  };
}
