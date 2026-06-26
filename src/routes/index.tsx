import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  addShow,
  deleteShow,
  getShows,
  getStats,
  incrementProgress,
  updateShow,
} from "~/server/shows";
import { searchTmdb } from "~/server/tmdb";
import { STATUS_LABELS, TMDB_POSTER_BASE } from "~/lib/constants";
import {
  WATCH_STATUSES,
  type Show,
  type TmdbSearchResult,
  type WatchStatus,
} from "~/lib/types";

export const Route = createFileRoute("/")({
  // Both reads run on the server before the page renders, so the first
  // paint already has the library and the stats in it.
  loader: async () => {
    const [shows, stats] = await Promise.all([getShows(), getStats()]);
    return { shows, stats };
  },
  component: Home,
});

function Home() {
  const { shows, stats } = Route.useLoaderData();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Re-run the loader so shows and stats reflect the latest database state.
  const refresh = () => router.invalidate();

  async function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearching(true);
    try {
      const found = await searchTmdb({ data: { query: trimmed } });
      setResults(found);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(tmdbId: number) {
    setAddingId(tmdbId);
    try {
      await addShow({ data: { tmdbId, status: "plan_to_watch" } });
      await refresh();
    } finally {
      setAddingId(null);
    }
  }

  async function handleIncrement(id: string) {
    setBusyId(id);
    try {
      await incrementProgress({ data: { id } });
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleStatus(id: string, status: WatchStatus) {
    setBusyId(id);
    try {
      await updateShow({ data: { id, status } });
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleRating(id: string, rating: number | null) {
    setBusyId(id);
    try {
      await updateShow({ data: { id, rating } });
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      await deleteShow({ data: { id } });
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  const trackedIds = new Set(shows.map((show) => show.tmdbId));

  return (
    <main className="page">
      <header className="masthead">
        <h1>Movie/TV Show Tracker</h1>
        <p>
          Search a show, add it to your list, and log episodes as you watch.
        </p>
      </header>

      <section className="stats" aria-label="Library stats">
        <div className="stat">
          <span className="stat-value">{stats.totalShows}</span>
          <span className="stat-label">Shows</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.episodesWatched}</span>
          <span className="stat-label">Episodes watched</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.watching}</span>
          <span className="stat-label">Watching</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Find a show</h2>
        <div className="search-row">
          <input
            className="search-input"
            type="text"
            value={query}
            placeholder="Try Severance, The Bear, Arcane..."
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearch();
            }}
          />
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {results.length > 0 && (
          <ul className="results">
            {results.map((result) => {
              const alreadyTracked = trackedIds.has(result.tmdbId);
              return (
                <li className="result" key={result.tmdbId}>
                  {result.posterPath ? (
                    <img
                      className="result-poster"
                      src={`${TMDB_POSTER_BASE}${result.posterPath}`}
                      alt={`${result.title} poster`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="result-poster poster-fallback">
                      {result.title.charAt(0)}
                    </div>
                  )}
                  <div className="result-info">
                    <p className="result-title">
                      {result.title}
                      {result.year ? (
                        <span className="result-year"> ({result.year})</span>
                      ) : null}
                    </p>
                    {result.overview ? (
                      <p className="result-overview">{result.overview}</p>
                    ) : null}
                  </div>
                  <button
                    className="btn btn-accent"
                    onClick={() => handleAdd(result.tmdbId)}
                    disabled={alreadyTracked || addingId === result.tmdbId}
                  >
                    {alreadyTracked
                      ? "Added"
                      : addingId === result.tmdbId
                        ? "Adding..."
                        : "Add"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2 className="panel-title">Your list</h2>
        {shows.length === 0 ? (
          <p className="empty">
            Nothing here yet. Search for a show above to start tracking it.
          </p>
        ) : (
          <ul className="library">
            {shows.map((show) => (
              <ShowCard
                key={show.id}
                show={show}
                busy={busyId === show.id}
                onIncrement={() => handleIncrement(show.id)}
                onStatus={(status) => handleStatus(show.id, status)}
                onRating={(rating) => handleRating(show.id, rating)}
                onDelete={() => handleDelete(show.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

interface ShowCardProps {
  show: Show;
  busy: boolean;
  onIncrement: () => void;
  onStatus: (status: WatchStatus) => void;
  onRating: (rating: number | null) => void;
  onDelete: () => void;
}

function ShowCard({
  show,
  busy,
  onIncrement,
  onStatus,
  onRating,
  onDelete,
}: ShowCardProps) {
  const percent =
    show.totalEpisodes > 0
      ? Math.round((show.episodesWatched / show.totalEpisodes) * 100)
      : 0;
  const atEnd =
    show.totalEpisodes > 0 && show.episodesWatched >= show.totalEpisodes;

  return (
    <li className="show-card">
      {show.posterPath ? (
        <img
          className="poster"
          src={`${TMDB_POSTER_BASE}${show.posterPath}`}
          alt={`${show.title} poster`}
          loading="lazy"
        />
      ) : (
        <div className="poster poster-fallback">{show.title.charAt(0)}</div>
      )}

      <div className="show-body">
        <div className="show-head">
          <h3 className="show-title">{show.title}</h3>
          <span className={`pill pill-${show.status}`}>
            {STATUS_LABELS[show.status]}
          </span>
        </div>

        <p className="show-meta">
          {show.totalSeasons} {show.totalSeasons === 1 ? "season" : "seasons"} ·{" "}
          {show.totalEpisodes} episodes
        </p>

        <div className="progress">
          <div className="progress-bar" style={{ width: `${percent}%` }} />
        </div>
        <p className="progress-text">
          {show.episodesWatched} / {show.totalEpisodes} episodes ({percent}%)
        </p>

        <div className="controls">
          <button
            className="btn btn-accent"
            onClick={onIncrement}
            disabled={busy || atEnd}
          >
            +1 episode
          </button>

          <select
            className="control-select"
            value={show.status}
            disabled={busy}
            onChange={(event) => onStatus(event.target.value as WatchStatus)}
          >
            {WATCH_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          <select
            className="control-select"
            value={show.rating ?? ""}
            disabled={busy}
            onChange={(event) =>
              onRating(event.target.value ? Number(event.target.value) : null)
            }
          >
            <option value="">Rate</option>
            {Array.from({ length: 10 }, (_, index) => index + 1).map(
              (score) => (
                <option key={score} value={score}>
                  {score}/10
                </option>
              )
            )}
          </select>

          <button className="btn btn-ghost" onClick={onDelete} disabled={busy}>
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
