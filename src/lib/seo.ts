/**
 * SEO & Dynamic Metadata Generation Utilities for Kineos
 * 
 * Generates targeted, search-engine-optimized keyword arrays and metadata
 * dynamically tailored to each movie and TV series.
 */

export interface MovieSeoData {
  title: string;
  releaseDate?: string | Date | null;
  genres?: (string | null | undefined)[];
  cast?: { name: string; role?: string }[] | string[];
}

export interface SeriesSeoData {
  title: string;
  releaseDate?: string | Date | null;
  genres?: (string | null | undefined)[];
  cast?: { name: string; role?: string }[] | string[];
  seasonCount?: number;
}

/**
 * Dynamically generates high-intent, targeted search keywords for a movie.
 * Combines title, release year, genres, lead actors, and high-frequency search queries.
 */
export function generateMovieKeywords(data: MovieSeoData): string[] {
  const { title } = data;
  if (!title) return ["movies", "watch movies online", "download HD movies", "Kineos"];

  const year = data.releaseDate ? new Date(data.releaseDate).getFullYear() : null;
  const validYear = year && !isNaN(year) ? year.toString() : null;
  
  const cleanGenres = (data.genres || [])
    .filter((g): g is string => Boolean(g && typeof g === "string"))
    .map(g => g.trim());

  const castNames: string[] = (data.cast || [])
    .map(c => (typeof c === "string" ? c : c?.name))
    .filter((name): name is string => Boolean(name && typeof name === "string"))
    .slice(0, 4); // Top 4 prominent cast members

  const keywords: string[] = [
    // 1. Primary Entity Identifiers
    title,
    `${title} movie`,
    ...(validYear ? [`${title} ${validYear}`, `${title} (${validYear})`] : []),

    // 2. High-Intent Streaming & Viewing Keywords
    `watch ${title} online`,
    `stream ${title} HD`,
    `${title} full movie`,
    `${title} full movie free`,
    `watch ${title} in 1080p`,

    // 3. Download & Offline Keywords
    `${title} download`,
    `${title} download 1080p`,
    `${title} download 720p`,
    `download ${title} movie free`,

    // 4. Content & Cast Specific Keywords
    `${title} cast`,
    `${title} storyline synopsis`,
    ...castNames.map(actor => `${actor} ${title}`),
    ...castNames.map(actor => `${actor} movies`),

    // 5. Dynamic Genre Combinations
    ...cleanGenres.map(genre => `${title} ${genre} movie`),
    ...cleanGenres.map(genre => `${genre} movies`),
    ...cleanGenres.map(genre => `watch ${genre} movies online`),

    // 6. Platform & Authority Keywords
    "Kineos movies",
    "watch movies online free HD",
    "download HD movies"
  ];

  // Return deduplicated array
  return Array.from(new Set(keywords));
}

/**
 * Dynamically generates high-intent, targeted search keywords for a TV series.
 * Combines title, release year, genres, lead actors, season counts, and episodic search queries.
 */
export function generateSeriesKeywords(data: SeriesSeoData): string[] {
  const { title } = data;
  if (!title) return ["TV series", "watch TV shows online", "download TV series", "Kineos"];

  const year = data.releaseDate ? new Date(data.releaseDate).getFullYear() : null;
  const validYear = year && !isNaN(year) ? year.toString() : null;

  const cleanGenres = (data.genres || [])
    .filter((g): g is string => Boolean(g && typeof g === "string"))
    .map(g => g.trim());

  const castNames: string[] = (data.cast || [])
    .map(c => (typeof c === "string" ? c : c?.name))
    .filter((name): name is string => Boolean(name && typeof name === "string"))
    .slice(0, 4); // Top 4 prominent cast members

  const seasons = data.seasonCount && data.seasonCount > 0 ? data.seasonCount : null;

  const keywords: string[] = [
    // 1. Primary Entity Identifiers
    title,
    `${title} series`,
    `${title} TV show`,
    ...(validYear ? [`${title} ${validYear}`, `${title} (${validYear})`] : []),

    // 2. Episodic & Season Specific Keywords
    `${title} all seasons`,
    `${title} episodes`,
    `${title} full episodes`,
    `${title} season 1`,
    ...(seasons && seasons > 1 ? [`${title} season ${seasons}`, `${title} all ${seasons} seasons`] : []),

    // 3. High-Intent Streaming Keywords
    `watch ${title} online`,
    `stream ${title} series HD`,
    `watch ${title} episodes free`,
    `binge ${title} online`,

    // 4. Download & Batch Keywords
    `${title} download`,
    `${title} all episodes download`,
    `${title} download 1080p 720p`,
    `${title} batch download`,

    // 5. Content & Cast Specific Keywords
    `${title} cast`,
    `${title} episode guide`,
    `${title} plot summary`,
    ...castNames.map(actor => `${actor} ${title}`),
    ...castNames.map(actor => `${actor} TV series`),

    // 6. Dynamic Genre Combinations
    ...cleanGenres.map(genre => `${title} ${genre} series`),
    ...cleanGenres.map(genre => `${genre} TV series`),
    ...cleanGenres.map(genre => `watch ${genre} series online`),

    // 7. Platform & Authority Keywords
    "Kineos TV series",
    "watch series online free HD",
    "download TV shows"
  ];

  // Return deduplicated array
  return Array.from(new Set(keywords));
}
