"use server";

import { db } from "@/lib/db";
import { movies, series, genres, movieGenres, seriesGenres, mediaAssets } from "@/lib/db/schema";
import { desc, asc, eq, and, ilike, sql, inArray } from "drizzle-orm";

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
        query = query.orderBy(desc(movies.rating));
      } else {
        query = query.orderBy(desc(movies.releaseDate)); // Default "Latest"
      }

      const results = await query.limit(limit).offset(offset);
      const ids = results.map(r => r.id);
      
      let posters: any[] = [];
      if (ids.length > 0) {
        posters = await db.select().from(mediaAssets).where(
          and(inArray(mediaAssets.contentId, ids), eq(mediaAssets.type, 'poster'), eq(mediaAssets.contentType, 'movie'))
        );
      }

      return results.map(m => {
        const poster = posters.find(p => p.contentId === m.id);
        return {
          ...m,
          genres: [genre || 'Movie'],
          imageUrl: poster ? poster.url : ""
        };
      });
    } else {
      let query = db
        .selectDistinct({
          id: series.id,
          title: series.title,
          slug: series.slug,
          description: series.description,
          releaseDate: series.releaseDate,
          rating: sql`NULL`,
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
      } else if (sort === "Rating") {
        query = query.orderBy(desc(series.viewCount)); // Series doesn't have rating yet, sort by views as fallback
      } else {
        query = query.orderBy(desc(series.releaseDate));
      }

      const results = await query.limit(limit).offset(offset);
      const ids = results.map(r => r.id);
      
      let posters: any[] = [];
      if (ids.length > 0) {
        posters = await db.select().from(mediaAssets).where(
          and(inArray(mediaAssets.contentId, ids), eq(mediaAssets.type, 'poster'), eq(mediaAssets.contentType, 'series'))
        );
      }

      return results.map(m => {
        const poster = posters.find(p => p.contentId === m.id);
        return {
          ...m,
          genres: [genre || 'Series'],
          imageUrl: poster ? poster.url : ""
        };
      });
    }
  } catch (error: any) {
    console.error("Database connection failed (fetchCatalogItems).", error.message);
    return [];
  }
}
