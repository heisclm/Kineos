"use server";

import { db } from "@/lib/db";
import { movies, series, genres, movieGenres, seriesGenres } from "@/lib/db/schema";
import { desc, asc, eq, and, ilike, sql } from "drizzle-orm";

export async function fetchCatalogItems(
  type: "movie" | "series",
  page: number,
  limit: number,
  genre?: string,
  sort?: string
) {
  try {
    const offset = (page - 1) * limit;

    if (type === "movie") {
      let query = db
        .selectDistinct({
          id: movies.id,
          title: movies.title,
          slug: movies.slug,
          description: movies.description,
          releaseDate: movies.releaseDate,
          rating: movies.rating,
          viewCount: movies.viewCount,
        })
        .from(movies)
        .leftJoin(movieGenres, eq(movies.id, movieGenres.movieId))
        .leftJoin(genres, eq(movieGenres.genreId, genres.id))
        .where(eq(movies.publicationStatus, "published"))
        .$dynamic();

      if (genre && genre !== "All Genres") {
        query = query.where(and(
          eq(movies.publicationStatus, "published"),
          ilike(genres.name, genre)
        ));
      }

      // Sort logic
      if (sort === "Popular") {
        query = query.orderBy(desc(movies.viewCount));
      } else if (sort === "A-Z") {
        query = query.orderBy(asc(movies.title));
      } else if (sort === "Rating") {
        query = query.orderBy(desc(movies.rating)); // Assuming rating exists and is sortable
      } else {
        query = query.orderBy(desc(movies.releaseDate)); // Default "Latest"
      }

      const results = await query.limit(limit).offset(offset);
      
      return results.map(m => ({ ...m, genres: [genre || 'Movie'] })); // Mock genre array for now
    } else {
      let query = db
        .selectDistinct({
          id: series.id,
          title: series.title,
          slug: series.slug,
          description: series.description,
          releaseDate: series.releaseDate,
          viewCount: series.viewCount,
        })
        .from(series)
        .leftJoin(seriesGenres, eq(series.id, seriesGenres.seriesId))
        .leftJoin(genres, eq(seriesGenres.genreId, genres.id))
        .where(eq(series.publicationStatus, "published"))
        .$dynamic();

      if (genre && genre !== "All Genres") {
        query = query.where(and(
          eq(series.publicationStatus, "published"),
          ilike(genres.name, genre)
        ));
      }

      if (sort === "Popular") {
        query = query.orderBy(desc(series.viewCount));
      } else if (sort === "A-Z") {
        query = query.orderBy(asc(series.title));
      } else {
        query = query.orderBy(desc(series.releaseDate));
      }

      const results = await query.limit(limit).offset(offset);
      return results.map(s => ({ ...s, genres: [genre || 'Series'] }));
    }
  } catch (error) {
    console.error("Failed to fetch catalog items", error);
    return [];
  }
}
