import { db } from "@/lib/db";
import {
  movies,
  series,
  genres,
  movieGenres,
  seriesGenres,
  mediaAssets,
  downloadSources,
} from "@/lib/db/schema";
import { desc, eq, and, ilike } from "drizzle-orm";

/**
 * Gets the latest published movies with their genres.
 */
export async function getLatestMovies(limit = 10) {
  try {
    const result = await db
      .select({
        id: movies.id,
        title: movies.title,
        slug: movies.slug,
        description: movies.description,
        releaseDate: movies.releaseDate,
        rating: movies.rating,
        genre: genres.name,
      })
      .from(movies)
      .leftJoin(movieGenres, eq(movies.id, movieGenres.movieId))
      .leftJoin(genres, eq(movieGenres.genreId, genres.id))
      .where(eq(movies.publicationStatus, "published"))
      .orderBy(desc(movies.releaseDate))
      .limit(limit * 3); 

    const movieMap = new Map<string, any>();
    
    for (const row of result) {
      if (!movieMap.has(row.id)) {
        movieMap.set(row.id, {
          id: row.id,
          title: row.title,
          slug: row.slug,
          description: row.description,
          releaseDate: row.releaseDate,
          rating: row.rating,
          genres: [],
        });
      }
      if (row.genre) {
        movieMap.get(row.id).genres.push(row.genre);
      }
    }

        return Array.from(movieMap.values()).slice(0, limit);
  } catch (error: any) {
    console.error("Database connection failed", error.message);
    return []; 
  }
}

export async function getTopRatedMovies(limit = 10) {
  try {
    const result = await db
      .select({
        id: movies.id,
        title: movies.title,
        slug: movies.slug,
        description: movies.description,
        releaseDate: movies.releaseDate,
        rating: movies.rating,
        viewCount: movies.viewCount,
        ratingScore: movies.ratingScore,
        genre: genres.name,
      })
      .from(movies)
      .leftJoin(movieGenres, eq(movies.id, movieGenres.movieId))
      .leftJoin(genres, eq(movieGenres.genreId, genres.id))
      .where(eq(movies.publicationStatus, "published"))
      .orderBy(desc(movies.ratingScore))
      .limit(limit * 3); 

    const movieMap = new Map<string, any>();
    for (const row of result) {
      if (!movieMap.has(row.id)) {
        movieMap.set(row.id, {
          id: row.id, title: row.title, slug: row.slug, description: row.description, releaseDate: row.releaseDate, rating: row.rating, viewCount: row.viewCount, ratingScore: row.ratingScore, genres: [],
        });
      }
      if (row.genre) movieMap.get(row.id).genres.push(row.genre);
    }
    return Array.from(movieMap.values()).slice(0, limit);
  } catch (error: any) {
    console.error("Database connection failed (getTopRatedMovies).", error.message);
    return [];
  }
}

export async function getTrendingMovies(limit = 10) {
  try {
    const result = await db
      .select({
        id: movies.id,
        title: movies.title,
        slug: movies.slug,
        description: movies.description,
        releaseDate: movies.releaseDate,
        rating: movies.rating,
        viewCount: movies.viewCount,
        genre: genres.name,
      })
      .from(movies)
      .leftJoin(movieGenres, eq(movies.id, movieGenres.movieId))
      .leftJoin(genres, eq(movieGenres.genreId, genres.id))
      .where(eq(movies.publicationStatus, "published"))
      .orderBy(desc(movies.viewCount))
      .limit(limit * 3); 

    const movieMap = new Map<string, any>();
    for (const row of result) {
      if (!movieMap.has(row.id)) {
        movieMap.set(row.id, {
          id: row.id, title: row.title, slug: row.slug, description: row.description, releaseDate: row.releaseDate, rating: row.rating, viewCount: row.viewCount, genres: [],
        });
      }
      if (row.genre) movieMap.get(row.id).genres.push(row.genre);
    }
    return Array.from(movieMap.values()).slice(0, limit);
  } catch (error: any) {
    console.error("Database connection failed (getTrendingMovies).", error.message);
    return [];
  }
}

/**
 * Gets a specific movie by its slug.
 */
export async function getMovieBySlug(slug: string) {
  try {
    const result = await db
      .select()
      .from(movies)
      .where(and(eq(movies.slug, slug), eq(movies.publicationStatus, "published")))
      .limit(1);

    return result[0] || null;
  } catch (error: any) {
    console.error(`⚠️ Database connection failed (getMovieBySlug: ${slug}).`, error.message);
    return null;
  }
}

/**
 * Gets primary media assets (poster/backdrop) for content.
 */
export async function getPrimaryMedia(contentId: string, contentType: "movie" | "series" | "episode") {
  try {
    return await db
      .select()
      .from(mediaAssets)
      .where(
        and(
          eq(mediaAssets.contentId, contentId),
          eq(mediaAssets.contentType, contentType),
          eq(mediaAssets.isPrimary, true)
        )
      );
  } catch (error: any) {
    console.error("⚠️ Database connection failed (getPrimaryMedia).", error.message);
    return [];
  }
}

/**
 * Gets active download sources for a specific piece of content.
 */
export async function getDownloadSourcesForContent(
  contentId: string,
  contentType: "movie" | "series" | "episode"
) {
  try {
    return await db
      .select()
      .from(downloadSources)
      .where(
        and(
          eq(downloadSources.contentId, contentId),
          eq(downloadSources.contentType, contentType),
          eq(downloadSources.isActive, true),
          eq(downloadSources.uploadStatus, "READY")
        )
      );
  } catch (error: any) {
    console.error("⚠️ Database connection failed (getDownloadSources).", error.message);
    return [];
  }
}

/**
 * Search movies by title.
 */
export async function searchMovies(query: string, limit = 20) {
  try {
    const result = await db
      .select({
        id: movies.id,
        title: movies.title,
        slug: movies.slug,
        description: movies.description,
      })
      .from(movies)
      .where(and(
        eq(movies.publicationStatus, 'published'),
        ilike(movies.title, `%${query}%`)
      ))
      .limit(limit);
      
    return result;
  } catch (error: any) {
    console.error('⚠️ Database connection failed (searchMovies).', error.message);
    return [];
  }
}



export async function getSeriesBySlug(slug: string) {
  try {
    const result = await db
      .select({
        id: series.id,
        title: series.title,
        slug: series.slug,
        description: series.description,
        releaseDate: series.releaseDate,
        
        viewCount: series.viewCount,
        
        
      })
      .from(series)
      .where(and(eq(series.slug, slug), eq(series.publicationStatus, "published")))
      .limit(1);

    if (result.length === 0) return null;
    const show = result[0];

    const showGenres = await db
      .select({ name: genres.name })
      .from(seriesGenres)
      .leftJoin(genres, eq(seriesGenres.genreId, genres.id))
      .where(eq(seriesGenres.seriesId, show.id));

    return {
      ...show,
      genres: showGenres.map(g => g.name).filter(Boolean)
    };
  } catch (error: any) {
    console.error("Database connection failed (getSeriesBySlug).", error.message);
    return null;
  }
}

export async function getSeriesEpisodes(seriesId: string) {
  try {
    const { seasons, episodes } = require('@/lib/db/schema');
    const { asc, eq } = require('drizzle-orm');
    
    const allSeasons = await db.select().from(seasons).where(eq(seasons.seriesId, seriesId)).orderBy(asc(seasons.seasonNumber));
    const allEpisodes = await db.select().from(episodes).orderBy(asc(episodes.episodeNumber));
    
    return allSeasons.map(s => ({
      ...s,
      episodes: allEpisodes.filter(e => e.seasonId === s.id)
    }));
  } catch (error: any) {
    return [];
  }
}






