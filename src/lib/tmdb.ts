/**
 * TMDB (The Movie Database) & YouTube Trailer Integration Utilities
 */

/**
 * Extracts a YouTube 11-character video ID from any YouTube URL format.
 * Supports:
 * - https://www.youtube.com/watch?v=s7EdQ4FqbhY
 * - https://youtu.be/s7EdQ4FqbhY
 * - https://www.youtube.com/embed/s7EdQ4FqbhY
 * - https://www.youtube.com/shorts/s7EdQ4FqbhY
 * - Raw 11-char ID
 */
export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();

  // If already an 11-character alphanumeric/hyphen/underscore string
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  // Regular expression to match standard YouTube URLs
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = cleanUrl.match(regExp);

  return match && match[1] ? match[1] : null;
}

/**
 * Constructs an embedded YouTube player URL.
 * Falls back to an automatic official trailer search if no specific link is provided.
 */
export function getYouTubeEmbedUrl(
  trailerUrl?: string | null,
  title?: string,
  releaseYear?: number | string | null
): string {
  const videoId = extractYouTubeId(trailerUrl);
  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  }

  const query = encodeURIComponent(`${title || "Movie"} ${releaseYear ? releaseYear + " " : ""}official trailer`);
  return `https://www.youtube-nocookie.com/embed?listType=search&list=${query}&autoplay=1`;
}

/**
 * Formats database ratingScore (0 - 100) to a clean 10-point scale (e.g. 84 -> "8.4")
 * If no score is provided or score is 0, falls back smoothly to default (8.4).
 */
export function formatKineosScore(
  ratingScore?: number | null,
  fallbackScore = 8.4
): { score: string; isFallback: boolean } {
  if (ratingScore && ratingScore > 0) {
    const normalized = ratingScore > 10 ? (ratingScore / 10).toFixed(1) : ratingScore.toFixed(1);
    return { score: normalized, isFallback: false };
  }
  return { score: fallbackScore.toFixed(1), isFallback: true };
}

/**
 * Fetches movie/series metadata directly from The Movie Database (TMDB) API
 * if TMDB_API_KEY is configured in the environment.
 */
export async function fetchTmdbMetadata(
  title: string,
  type: "movie" | "series" = "movie",
  year?: number | null
): Promise<{
  voteAverage: number | null;
  ratingScore: number | null;
  trailerUrl: string | null;
  overview: string | null;
} | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;

  try {
    const tmdbType = type === "series" ? "tv" : "movie";
    const yearParam = year ? (type === "series" ? `&first_air_date_year=${year}` : `&year=${year}`) : "";
    const searchUrl = `https://api.themoviedb.org/3/search/${tmdbType}?api_key=${apiKey}&query=${encodeURIComponent(title)}${yearParam}`;

    const res = await fetch(searchUrl, { next: { revalidate: 86400 } });
    if (!res.ok) return null;

    const data = await res.json();
    const firstResult = data.results?.[0];
    if (!firstResult) return null;

    const tmdbId = firstResult.id;
    const voteAverage = firstResult.vote_average ?? null;
    const ratingScore = voteAverage ? Math.round(voteAverage * 10) : null;

    // Fetch Videos to find official trailer
    let trailerUrl: string | null = null;
    try {
      const videosUrl = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}/videos?api_key=${apiKey}`;
      const videoRes = await fetch(videosUrl, { next: { revalidate: 86400 } });
      if (videoRes.ok) {
        const videoData = await videoRes.json();
        const trailer = (videoData.results || []).find(
          (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
        );
        if (trailer?.key) {
          trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
        }
      }
    } catch {
      // Ignore video fetch errors
    }

    return {
      voteAverage,
      ratingScore,
      trailerUrl,
      overview: firstResult.overview || null,
    };
  } catch (error) {
    console.error("TMDB fetch error:", error);
    return null;
  }
}

export interface TmdbCandidate {
  id: number;
  title: string;
  originalTitle?: string;
  releaseYear: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string | null;
  voteAverage: number | null;
}

export interface TmdbDetailedResult {
  id: number;
  title: string;
  originalTitle?: string;
  slug: string;
  shortTeaser: string;
  description: string;
  releaseDate: string;
  runtime: number | null;
  rating: string;
  language: string;
  ratingScore: number;
  trailerUrl: string;
  genres: string;
  cast: string;
  posterUrl: string;
  backdropUrl: string;
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Searches TMDB for matching titles by query (title or ID).
 */
export async function searchTmdbCandidates(
  query: string,
  type: "movie" | "series" = "movie",
  customApiKey?: string | null
): Promise<TmdbCandidate[]> {
  const apiKey = (customApiKey?.trim() || process.env.TMDB_API_KEY)?.trim();
  if (!apiKey || !query.trim()) return [];

  try {
    const tmdbType = type === "series" ? "tv" : "movie";
    const cleanQuery = query.trim();

    // Check if query is an IMDb ID (e.g. tt1375666)
    if (/^tt\d+$/i.test(cleanQuery)) {
      const findUrl = `https://api.themoviedb.org/3/find/${cleanQuery}?api_key=${apiKey}&external_source=imdb_id`;
      const res = await fetch(findUrl, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        const results = type === "series" ? data.tv_results : data.movie_results;
        if (results && results.length > 0) {
          return results.map((r: any) => ({
            id: r.id,
            title: r.title || r.name,
            originalTitle: r.original_title || r.original_name,
            releaseYear: (r.release_date || r.first_air_date || "").slice(0, 4) || null,
            posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null,
            backdropUrl: r.backdrop_path ? `https://image.tmdb.org/t/p/w780${r.backdrop_path}` : null,
            overview: r.overview || null,
            voteAverage: r.vote_average ?? null,
          }));
        }
      }
    }

    const searchUrl = `https://api.themoviedb.org/3/search/${tmdbType}?api_key=${apiKey}&query=${encodeURIComponent(cleanQuery)}&include_adult=false`;
    const res = await fetch(searchUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const data = await res.json();
    return (data.results || []).slice(0, 8).map((r: any) => ({
      id: r.id,
      title: r.title || r.name,
      originalTitle: r.original_title || r.original_name,
      releaseYear: (r.release_date || r.first_air_date || "").slice(0, 4) || null,
      posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null,
      backdropUrl: r.backdrop_path ? `https://image.tmdb.org/t/p/w780${r.backdrop_path}` : null,
      overview: r.overview || null,
      voteAverage: r.vote_average ?? null,
    }));
  } catch (error) {
    console.error("searchTmdbCandidates error:", error);
    return [];
  }
}

/**
 * Fetches full details for a chosen TMDB candidate to autofill the admin form.
 */
export async function fetchTmdbFullDetails(
  tmdbId: number,
  type: "movie" | "series" = "movie",
  customApiKey?: string | null
): Promise<TmdbDetailedResult | null> {
  const apiKey = (customApiKey?.trim() || process.env.TMDB_API_KEY)?.trim();
  if (!apiKey || !tmdbId) return null;

  try {
    const tmdbType = type === "series" ? "tv" : "movie";
    const append =
      type === "series"
        ? "videos,credits,content_ratings"
        : "videos,credits,release_dates";
    const url = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}?api_key=${apiKey}&append_to_response=${append}`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const data = await res.json();
    const title = data.title || data.name || "";
    const originalTitle = data.original_title || data.original_name || "";
    const releaseDate = data.release_date || data.first_air_date || "";

    // Age rating / certification
    let rating = "";
    if (type === "movie" && data.release_dates?.results) {
      const usRelease = data.release_dates.results.find((r: any) => r.iso_3166_1 === "US");
      const certObj = usRelease?.release_dates?.find((d: any) => Boolean(d.certification));
      rating = certObj?.certification || "";
    } else if (type === "series" && data.content_ratings?.results) {
      const usRating = data.content_ratings.results.find((r: any) => r.iso_3166_1 === "US");
      rating = usRating?.rating || "";
    }

    // Official Trailer
    let trailerUrl = "";
    if (data.videos?.results) {
      const trailer = data.videos.results.find(
        (v: any) =>
          v.site === "YouTube" &&
          (v.type === "Trailer" || v.type === "Teaser" || v.type === "Clip")
      );
      if (trailer?.key) {
        trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
      }
    }

    // Genres
    const genres = (data.genres || []).map((g: any) => g.name).join(", ");

    // Cast (Top 6 actors)
    const cast = (data.credits?.cast || [])
      .slice(0, 6)
      .map((c: any) => c.name)
      .join(", ");

    // Runtime
    const runtime =
      type === "movie"
        ? data.runtime || null
        : data.episode_run_time?.[0] || null;

    // Language
    const language =
      data.spoken_languages?.[0]?.english_name ||
      data.original_language?.toUpperCase() ||
      "English";

    // Rating score (0-100)
    const ratingScore = data.vote_average ? Math.round(data.vote_average * 10) : 84;

    // Artwork
    const posterUrl = data.poster_path
      ? `https://image.tmdb.org/t/p/w780${data.poster_path}`
      : "";
    const backdropUrl = data.backdrop_path
      ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
      : "";

    // Short Teaser
    const shortTeaser =
      data.tagline?.trim() ||
      (data.overview ? data.overview.slice(0, 160).trim() + "..." : "");

    return {
      id: data.id,
      title,
      originalTitle,
      slug: slugify(title),
      shortTeaser,
      description: data.overview || "",
      releaseDate,
      runtime,
      rating: rating || (type === "movie" ? "PG-13" : "TV-14"),
      language,
      ratingScore,
      trailerUrl,
      genres,
      cast,
      posterUrl,
      backdropUrl,
    };
  } catch (error) {
    console.error("fetchTmdbFullDetails error:", error);
    return null;
  }
}

