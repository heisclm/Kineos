import { db } from "@/lib/db";
import { movies, series, genres, movieGenres, seriesGenres, mediaAssets, downloadSources, people, movieCast, seriesCast } from "@/lib/db/schema";
import { desc, eq, and, ilike, sql, inArray } from "drizzle-orm";


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
          shortTeaser: movies.shortTeaser,
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
    const ids: string[] = [];
    
    for (const row of result) {
      if (!movieMap.has(row.id)) {
        ids.push(row.id);
        movieMap.set(row.id, {
          id: row.id,
          title: row.title,
          slug: row.slug,
          description: row.description,
            shortTeaser: row.shortTeaser,
          releaseDate: row.releaseDate,
          rating: row.rating,
          genres: [],
          imageUrl: '',
          backdropUrl: '',
        });
      }
      if (row.genre) movieMap.get(row.id).genres.push(row.genre);
    }

    if (ids.length > 0) {
      const media = await db.select().from(mediaAssets).where(inArray(mediaAssets.contentId, ids));
      for (const m of media) {
        const item = movieMap.get(m.contentId);
        if (item) {
          if (m.type === 'poster') item.imageUrl = m.url;
          if (m.type === 'backdrop') item.backdropUrl = m.url;
        }
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
          shortTeaser: movies.shortTeaser,
        releaseDate: movies.releaseDate,
        rating: movies.rating,
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
    const ids: string[] = [];
    for (const row of result) {
      if (!movieMap.has(row.id)) {
        ids.push(row.id);
        movieMap.set(row.id, {
          id: row.id, title: row.title, slug: row.slug, description: row.description,
            shortTeaser: row.shortTeaser, releaseDate: row.releaseDate, rating: row.rating, ratingScore: row.ratingScore, genres: [], imageUrl: '', backdropUrl: ''
        });
      }
      if (row.genre) movieMap.get(row.id).genres.push(row.genre);
    }
    
    if (ids.length > 0) {
      const media = await db.select().from(mediaAssets).where(inArray(mediaAssets.contentId, ids));
      for (const m of media) {
        const item = movieMap.get(m.contentId);
        if (item) {
          if (m.type === 'poster') item.imageUrl = m.url;
          if (m.type === 'backdrop') item.backdropUrl = m.url;
        }
      }
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
          shortTeaser: movies.shortTeaser,
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
    const ids: string[] = [];
    for (const row of result) {
      if (!movieMap.has(row.id)) {
        ids.push(row.id);
        movieMap.set(row.id, {
          id: row.id, title: row.title, slug: row.slug, description: row.description,
            shortTeaser: row.shortTeaser, releaseDate: row.releaseDate, rating: row.rating, viewCount: row.viewCount, genres: [], imageUrl: '', backdropUrl: ''
        });
      }
      if (row.genre) movieMap.get(row.id).genres.push(row.genre);
    }
    if (ids.length > 0) {
      const media = await db.select().from(mediaAssets).where(inArray(mediaAssets.contentId, ids));
      for (const m of media) {
        const item = movieMap.get(m.contentId);
        if (item) {
          if (m.type === 'poster') item.imageUrl = m.url;
          if (m.type === 'backdrop') item.backdropUrl = m.url;
        }
      }
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

    const movie = result[0] || null;
    if (movie) {
      const media = await db.select().from(mediaAssets).where(eq(mediaAssets.contentId, movie.id));
      for (const m of media) {
        if (m.type === 'poster') (movie as any).imageUrl = m.url;
        if (m.type === 'backdrop') (movie as any).backdropUrl = m.url;
      }
    }
    return movie;
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
          shortTeaser: movies.shortTeaser,
      })
      .from(movies)
      .where(and(
        eq(movies.publicationStatus, 'published'),
        ilike(movies.title, `%${query}%`)
      ))
      .limit(limit);
      
    if (result.length > 0) {
      const ids = result.map(r => r.id);
      const media = await db.select().from(mediaAssets).where(inArray(mediaAssets.contentId, ids));
      for (const row of result) {
        const m = media.find(m => m.contentId === row.id && m.type === 'poster');
        if (m) (row as any).imageUrl = m.url;
      }
    }
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
          shortTeaser: series.shortTeaser,
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









export async function getCastForContent(contentId: string, type: "movie" | "series") {
  try {
    if (type === "movie") {
      return await db.select({ name: people.name, role: movieCast.roleName, imageUrl: people.imageUrl })
        .from(movieCast)
        .innerJoin(people, eq(movieCast.personId, people.id))
        .where(eq(movieCast.movieId, contentId))
        .orderBy(movieCast.order);
    } else {
      return await db.select({ name: people.name, role: seriesCast.roleName, imageUrl: people.imageUrl })
        .from(seriesCast)
        .innerJoin(people, eq(seriesCast.personId, people.id))
        .where(eq(seriesCast.seriesId, contentId))
        .orderBy(seriesCast.order);
    }
  } catch (e) {
    return [];
  }
}

export async function getRelatedMovies(movieId: string, limit = 5) {
  try {
    // Just fetch latest movies that aren't this one as a simple fallback
    const result = await db.select({
        id: movies.id,
        title: movies.title,
        slug: movies.slug,
        description: movies.description,
          shortTeaser: movies.shortTeaser,
        releaseDate: movies.releaseDate,
        genre: genres.name,
    })
    .from(movies)
    .leftJoin(movieGenres, eq(movies.id, movieGenres.movieId))
    .leftJoin(genres, eq(movieGenres.genreId, genres.id))
    .where(and(eq(movies.publicationStatus, "published"), sql`${movies.id} != ${movieId}`))
    .orderBy(desc(movies.createdAt))
    .limit(limit);
    
    // Deduplicate by ID
    const unique = [];
      const seen = new Set();
      for (const row of result) {
        if (!seen.has(row.id)) {
          seen.add(row.id);
          unique.push(row);
        }
      }
      
      if (unique.length > 0) {
        const ids = unique.map(r => r.id);
        const media = await db.select().from(mediaAssets).where(inArray(mediaAssets.contentId, ids));
        for (const row of unique) {
          const m = media.find(m => m.contentId === row.id && m.type === 'poster');
          if (m) (row as any).imageUrl = m.url;
        }
      }

      return unique;
  } catch (e) {
    return [];
  }
}

export async function getRelatedSeries(seriesId: string, limit = 5) {
  try {
    const result = await db.select({
        id: series.id,
        title: series.title,
        slug: series.slug,
        description: series.description,
          shortTeaser: series.shortTeaser,
        releaseDate: series.releaseDate,
        genre: genres.name,
    })
    .from(series)
    .leftJoin(seriesGenres, eq(series.id, seriesGenres.seriesId))
    .leftJoin(genres, eq(seriesGenres.genreId, genres.id))
    .where(and(eq(series.publicationStatus, "published"), sql`${series.id} != ${seriesId}`))
    .orderBy(desc(series.createdAt))
    .limit(limit);
    
    const unique = [];
      const seen = new Set();
      for (const row of result) {
        if (!seen.has(row.id)) {
          seen.add(row.id);
          unique.push(row);
        }
      }
      
      if (unique.length > 0) {
        const ids = unique.map(r => r.id);
        const media = await db.select().from(mediaAssets).where(inArray(mediaAssets.contentId, ids));
        for (const row of unique) {
          const m = media.find(m => m.contentId === row.id && m.type === 'poster');
          if (m) (row as any).imageUrl = m.url;
        }
      }

      return unique;
  } catch (e) {
    return [];
  }
}






export async function getAdminMovieById(id: string) {
  try {
    const result = await db.select().from(movies).where(eq(movies.id, id)).limit(1);
    const movie = result[0] || null;
    if (movie) {
      const media = await db.select().from(mediaAssets).where(eq(mediaAssets.contentId, movie.id));
      for (const m of media) {
        if (m.type === 'poster') (movie as any).imageUrl = m.url;
        if (m.type === 'backdrop') (movie as any).backdropUrl = m.url;
      }
      
      const castRows = await db.select({ name: people.name }).from(movieCast).innerJoin(people, eq(movieCast.personId, people.id)).where(eq(movieCast.movieId, movie.id)).orderBy(movieCast.order);
      (movie as any).cast = castRows.map(c => c.name);

      const genreRows = await db.select({ name: genres.name }).from(movieGenres).innerJoin(genres, eq(movieGenres.genreId, genres.id)).where(eq(movieGenres.movieId, movie.id));
      (movie as any).genres = genreRows.map(g => g.name);
    }
    return movie;
  } catch (error: any) {
    console.error("Database connection failed (getAdminMovieById).", error.message);
    return null;
  }
}

export async function getAdminSeriesById(id: string) {
  try {
    const result = await db.select().from(series).where(eq(series.id, id)).limit(1);
    const s = result[0] || null;
    if (s) {
      const media = await db.select().from(mediaAssets).where(eq(mediaAssets.contentId, s.id));
      for (const m of media) {
        if (m.type === 'poster') (s as any).imageUrl = m.url;
        if (m.type === 'backdrop') (s as any).backdropUrl = m.url;
      }
      
      const castRows = await db.select({ name: people.name }).from(seriesCast).innerJoin(people, eq(seriesCast.personId, people.id)).where(eq(seriesCast.seriesId, s.id)).orderBy(seriesCast.order);
      (s as any).cast = castRows.map(c => c.name);

      const genreRows = await db.select({ name: genres.name }).from(seriesGenres).innerJoin(genres, eq(seriesGenres.genreId, genres.id)).where(eq(seriesGenres.seriesId, s.id));
      (s as any).genres = genreRows.map(g => g.name);
    }
    return s;
  } catch (error: any) {
    console.error("Database connection failed (getAdminSeriesById).", error.message);
    return null;
  }
}

