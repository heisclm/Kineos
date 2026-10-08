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
