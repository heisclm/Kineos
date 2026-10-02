"use server";

import { db } from "@/lib/db";
import { 
  movies, series, 
  movieCast, seriesCast, 
  movieGenres, seriesGenres, 
  people, genres,
  mediaAssets
} from "@/lib/db/schema";
import { ilike, or, eq, sql, and } from "drizzle-orm";

export type SearchResult = {
  id: string;
  title: string;
  slug: string;
  type: "movie" | "series";
  releaseDate: string | null;
  imageUrl: string | null;
};

export async function searchContent(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = `%${query.trim()}%`;

  // We need to fetch matching movies and series based on title, actor, or genre.
  // Using DISTINCT because a movie might match multiple actors/genres.

  try {
    // 1. Search Movies
    const movieMatches = await db
      .selectDistinct({
        id: movies.id,
        title: movies.title,
        slug: movies.slug,
        releaseDate: movies.releaseDate,
        imageUrl: mediaAssets.url, // Try to grab primary poster
      })
      .from(movies)
      .leftJoin(movieCast, eq(movies.id, movieCast.movieId))
      .leftJoin(people, eq(movieCast.personId, people.id))
      .leftJoin(movieGenres, eq(movies.id, movieGenres.movieId))
      .leftJoin(genres, eq(movieGenres.genreId, genres.id))
      .leftJoin(mediaAssets, and(eq(mediaAssets.contentId, movies.id), eq(mediaAssets.isPrimary, true), eq(mediaAssets.type, 'poster')))
      .where(
        or(
          ilike(movies.title, searchTerm),
          ilike(people.name, searchTerm),
          ilike(genres.name, searchTerm)
        )
      )
      .limit(5);

    // 2. Search Series
    const seriesMatches = await db
      .selectDistinct({
        id: series.id,
        title: series.title,
        slug: series.slug,
        releaseDate: series.releaseDate,
        imageUrl: mediaAssets.url, // Try to grab primary poster
      })
      .from(series)
      .leftJoin(seriesCast, eq(series.id, seriesCast.seriesId))
      .leftJoin(people, eq(seriesCast.personId, people.id))
      .leftJoin(seriesGenres, eq(series.id, seriesGenres.seriesId))
      .leftJoin(genres, eq(seriesGenres.genreId, genres.id))
      .leftJoin(mediaAssets, and(eq(mediaAssets.contentId, series.id), eq(mediaAssets.isPrimary, true), eq(mediaAssets.type, 'poster')))
      .where(
        or(
          ilike(series.title, searchTerm),
          ilike(people.name, searchTerm),
          ilike(genres.name, searchTerm)
        )
      )
      .limit(5);

    // Combine and format
    const results: SearchResult[] = [
      ...movieMatches.map(m => ({ ...m, type: "movie" as const })),
      ...seriesMatches.map(s => ({ ...s, type: "series" as const }))
    ];

    // Sort by some relevance or date, and limit to top 6 overall
    return results
      .sort((a, b) => {
        // Basic sort: Exact match first, then alphabetical
        const aExact = a.title.toLowerCase() === query.toLowerCase();
        const bExact = b.title.toLowerCase() === query.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.title.localeCompare(b.title);
      })
      .slice(0, 6);
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}
