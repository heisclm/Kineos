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
          shortTeaser: movies.shortTeaser,
          releaseDate: movies.releaseDate,
          rating: movies.rating,
          ratingScore: movies.ratingScore,
          runtime: movies.runtime,
          viewCount: movies.viewCount,
          createdAt: movies.createdAt,
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
        query = query.orderBy(desc(movies.ratingScore), desc(movies.viewCount));
      } else {
        query = query.orderBy(desc(movies.releaseDate), desc(movies.createdAt)); // Default "Latest"
      }

      const results = await query.limit(limit).offset(offset);
      const ids = results.map(r => r.id);
      
      let posters: any[] = [];
      let itemGenres: any[] = [];
      if (ids.length > 0) {
        const [pRows, gRows] = await Promise.all([
          db.select().from(mediaAssets).where(
            and(inArray(mediaAssets.contentId, ids), eq(mediaAssets.type, 'poster'), eq(mediaAssets.contentType, 'movie'))
          ),
          db.select({ contentId: movieGenres.movieId, name: genres.name })
            .from(movieGenres)
            .innerJoin(genres, eq(movieGenres.genreId, genres.id))
            .where(inArray(movieGenres.movieId, ids))
        ]);
        posters = pRows;
        itemGenres = gRows;
      }

      return results.map(m => {
        const poster = posters.find(p => p.contentId === m.id);
        const gList = itemGenres.filter(g => g.contentId === m.id).map(g => g.name);
        return {
          ...m,
          genres: gList.length > 0 ? gList : [genre && genre !== "All Genres" ? genre : 'Movie'],
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
          shortTeaser: series.shortTeaser,
          releaseDate: series.releaseDate,
          rating: series.rating,
          ratingScore: series.ratingScore,
          viewCount: series.viewCount,
          createdAt: series.createdAt,
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
        query = query.orderBy(desc(series.viewCount), desc(series.createdAt));
      } else if (sort === "A-Z") {
        query = query.orderBy(asc(series.title));
      } else if (sort === "Rating") {
        query = query.orderBy(desc(series.ratingScore), desc(series.viewCount));
      } else {
        query = query.orderBy(desc(series.releaseDate), desc(series.createdAt));
      }

      const results = await query.limit(limit).offset(offset);
      const ids = results.map(r => r.id);
      
      let posters: any[] = [];
      let itemGenres: any[] = [];
      if (ids.length > 0) {
        const [pRows, gRows] = await Promise.all([
          db.select().from(mediaAssets).where(
            and(inArray(mediaAssets.contentId, ids), eq(mediaAssets.type, 'poster'), eq(mediaAssets.contentType, 'series'))
          ),
          db.select({ contentId: seriesGenres.seriesId, name: genres.name })
            .from(seriesGenres)
            .innerJoin(genres, eq(seriesGenres.genreId, genres.id))
            .where(inArray(seriesGenres.seriesId, ids))
        ]);
        posters = pRows;
        itemGenres = gRows;
      }

      return results.map(m => {
        const poster = posters.find(p => p.contentId === m.id);
        const gList = itemGenres.filter(g => g.contentId === m.id).map(g => g.name);
        return {
          ...m,
          type: 'series' as const,
          genres: gList.length > 0 ? gList : [genre && genre !== "All Genres" ? genre : 'TV Series'],
          imageUrl: poster ? poster.url : ""
        };
      });
    }
  } catch (error: any) {
    console.error("Database connection failed (fetchCatalogItems).", error.message);
    return [];
  }
}

