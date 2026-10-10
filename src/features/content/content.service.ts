import { db } from "@/lib/db";
import { movies, series, seasons, episodes, genres, movieGenres, seriesGenres, mediaAssets, downloadSources, people, movieCast, seriesCast } from "@/lib/db/schema";
import { desc, eq, and, ilike, sql, inArray, notInArray, asc, count } from "drizzle-orm";
import { slugify } from "@/lib/utils";


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
        ratingScore: movies.ratingScore,
        runtime: movies.runtime,
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
          ratingScore: row.ratingScore,
          runtime: row.runtime,
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
        runtime: movies.runtime,
        genre: genres.name,
      })
      .from(movies)
      .leftJoin(movieGenres, eq(movies.id, movieGenres.movieId))
      .leftJoin(genres, eq(movieGenres.genreId, genres.id))
      .where(eq(movies.publicationStatus, "published"))
      .orderBy(desc(movies.ratingScore), desc(movies.viewCount))
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
          ratingScore: row.ratingScore,
          runtime: row.runtime,
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
        ratingScore: movies.ratingScore,
        runtime: movies.runtime,
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
          id: row.id,
          title: row.title,
          slug: row.slug,
          description: row.description,
          shortTeaser: row.shortTeaser,
          releaseDate: row.releaseDate,
          rating: row.rating,
          ratingScore: row.ratingScore,
          runtime: row.runtime,
          viewCount: row.viewCount,
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

    if (result.length === 0) return null;
    const movie = result[0] as any;

    const media = await db.select().from(mediaAssets).where(eq(mediaAssets.contentId, movie.id));
    for (const m of media) {
      if (m.type === 'poster') movie.imageUrl = m.url;
      if (m.type === 'backdrop') movie.backdropUrl = m.url;
    }

    const showGenres = await db
      .select({ name: genres.name })
      .from(movieGenres)
      .leftJoin(genres, eq(movieGenres.genreId, genres.id))
      .where(eq(movieGenres.movieId, movie.id));

    return {
      ...movie,
      genres: showGenres.map(g => g.name).filter(Boolean)
    };
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
      .select()
      .from(series)
      .where(and(eq(series.slug, slug), eq(series.publicationStatus, "published")))
      .limit(1);

    if (result.length === 0) return null;
    const show = result[0] as any;

    // Fetch media assets (poster & backdrop)
    const media = await db.select().from(mediaAssets).where(eq(mediaAssets.contentId, show.id));
    for (const m of media) {
      if (m.type === 'poster') show.imageUrl = m.url;
      if (m.type === 'backdrop') show.backdropUrl = m.url;
    }

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
    const allSeasons = await db
      .select()
      .from(seasons)
      .where(eq(seasons.seriesId, seriesId))
      .orderBy(asc(seasons.seasonNumber));

    if (allSeasons.length === 0) return [];

    const seasonIds = allSeasons.map((s) => s.id);
    const allEpisodes = await db
      .select()
      .from(episodes)
      .where(inArray(episodes.seasonId, seasonIds))
      .orderBy(asc(episodes.episodeNumber));

    const episodeIds = allEpisodes.map((e) => e.id);
    const allSources = episodeIds.length > 0
      ? await db
          .select()
          .from(downloadSources)
          .where(
            and(
              eq(downloadSources.contentType, 'episode'),
              inArray(downloadSources.contentId, episodeIds),
              eq(downloadSources.isActive, true)
            )
          )
      : [];

    return allSeasons.map((s) => ({
      ...s,
      episodes: allEpisodes
        .filter((e) => e.seasonId === s.id)
        .map((e) => ({
          ...e,
          sources: allSources.filter((src) => src.contentId === e.id),
        })),
    }));
  } catch (error: any) {
    console.error("Database connection failed (getSeriesEpisodes).", error.message);
    return [];
  }
}









export async function getCastForContent(contentId: string, type: "movie" | "series") {
  try {
    if (type === "movie") {
      return await db.select({ id: people.id, name: people.name, role: movieCast.roleName, imageUrl: people.imageUrl })
        .from(movieCast)
        .innerJoin(people, eq(movieCast.personId, people.id))
        .where(eq(movieCast.movieId, contentId))
        .orderBy(movieCast.order);
    } else {
      return await db.select({ id: people.id, name: people.name, role: seriesCast.roleName, imageUrl: people.imageUrl })
        .from(seriesCast)
        .innerJoin(people, eq(seriesCast.personId, people.id))
        .where(eq(seriesCast.seriesId, contentId))
        .orderBy(seriesCast.order);
    }
  } catch (e) {
    return [];
  }
}

export async function getRelatedMovies(movieId: string, limit = 12) {
  try {
    // 1. Fetch current movie's genre IDs
    const currentGenres = await db
      .select({ genreId: movieGenres.genreId })
      .from(movieGenres)
      .where(eq(movieGenres.movieId, movieId));

    const genreIds = currentGenres.map((g) => g.genreId);
    let matchedMovieIds: string[] = [];

    // 2. Query movies sharing genres, ranked by match count, rating score, and popularity
    if (genreIds.length > 0) {
      const genreMatches = await db
        .select({
          id: movies.id,
          matchCount: sql<number>`count(distinct ${movieGenres.genreId})`,
        })
        .from(movies)
        .innerJoin(movieGenres, eq(movies.id, movieGenres.movieId))
        .where(
          and(
            eq(movies.publicationStatus, "published"),
            sql`${movies.id} != ${movieId}`,
            inArray(movieGenres.genreId, genreIds)
          )
        )
        .groupBy(movies.id)
        .orderBy(
          desc(sql`count(distinct ${movieGenres.genreId})`),
          desc(movies.ratingScore),
          desc(movies.viewCount),
          desc(movies.releaseDate)
        )
        .limit(limit);

      matchedMovieIds = genreMatches.map((m) => m.id);
    }

    // 3. Fallback / Backfill if fewer than limit matches
    const finalIds = [...matchedMovieIds];
    if (finalIds.length < limit) {
      const excludedIds = [movieId, ...matchedMovieIds];
      const backfill = await db
        .select({ id: movies.id })
        .from(movies)
        .where(
          and(
            eq(movies.publicationStatus, "published"),
            notInArray(movies.id, excludedIds)
          )
        )
        .orderBy(
          desc(movies.ratingScore),
          desc(movies.viewCount),
          desc(movies.releaseDate)
        )
        .limit(limit - finalIds.length);

      finalIds.push(...backfill.map((b) => b.id));
    }

    if (finalIds.length === 0) return [];

    // 4. Hydrate full movie details
    const movieRows = await db
      .select({
        id: movies.id,
        title: movies.title,
        slug: movies.slug,
        description: movies.description,
        shortTeaser: movies.shortTeaser,
        releaseDate: movies.releaseDate,
        rating: movies.rating,
        ratingScore: movies.ratingScore,
        runtime: movies.runtime,
      })
      .from(movies)
      .where(inArray(movies.id, finalIds));

    // 5. Hydrate posters
    const posters = await db
      .select({
        contentId: mediaAssets.contentId,
        url: mediaAssets.url,
      })
      .from(mediaAssets)
      .where(
        and(
          inArray(mediaAssets.contentId, finalIds),
          eq(mediaAssets.type, "poster")
        )
      );

    // 6. Hydrate genres
    const itemGenres = await db
      .select({
        movieId: movieGenres.movieId,
        genreName: genres.name,
      })
      .from(movieGenres)
      .innerJoin(genres, eq(movieGenres.genreId, genres.id))
      .where(inArray(movieGenres.movieId, finalIds));

    const posterMap = new Map<string, string>();
    for (const p of posters) {
      if (p.contentId && !posterMap.has(p.contentId)) {
        posterMap.set(p.contentId, p.url);
      }
    }

    const genreMap = new Map<string, string[]>();
    for (const g of itemGenres) {
      if (!genreMap.has(g.movieId)) {
        genreMap.set(g.movieId, []);
      }
      genreMap.get(g.movieId)!.push(g.genreName);
    }

    const movieMap = new Map(movieRows.map((m) => [m.id, m]));

    // Preserve the matched ranking order
    return finalIds
      .map((id) => {
        const item = movieMap.get(id);
        if (!item) return null;
        const gList = genreMap.get(id) || [];
        return {
          ...item,
          imageUrl: posterMap.get(id) || null,
          genre: gList[0] || "Movie",
          primaryGenre: gList[0] || "Movie",
          genres: gList,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  } catch (e) {
    console.error("Error in getRelatedMovies:", e);
    return [];
  }
}

export async function getRelatedSeries(seriesId: string, limit = 12) {
  try {
    // 1. Fetch current series's genre IDs
    const currentGenres = await db
      .select({ genreId: seriesGenres.genreId })
      .from(seriesGenres)
      .where(eq(seriesGenres.seriesId, seriesId));

    const genreIds = currentGenres.map((g) => g.genreId);
    let matchedSeriesIds: string[] = [];

    // 2. Query series sharing genres, ranked by match count, rating score, and popularity
    if (genreIds.length > 0) {
      const genreMatches = await db
        .select({
          id: series.id,
          matchCount: sql<number>`count(distinct ${seriesGenres.genreId})`,
        })
        .from(series)
        .innerJoin(seriesGenres, eq(series.id, seriesGenres.seriesId))
        .where(
          and(
            eq(series.publicationStatus, "published"),
            sql`${series.id} != ${seriesId}`,
            inArray(seriesGenres.genreId, genreIds)
          )
        )
        .groupBy(series.id)
        .orderBy(
          desc(sql`count(distinct ${seriesGenres.genreId})`),
          desc(series.ratingScore),
          desc(series.viewCount),
          desc(series.releaseDate)
        )
        .limit(limit);

      matchedSeriesIds = genreMatches.map((s) => s.id);
    }

    // 3. Fallback / Backfill if fewer than limit matches
    const finalIds = [...matchedSeriesIds];
    if (finalIds.length < limit) {
      const excludedIds = [seriesId, ...matchedSeriesIds];
      const backfill = await db
        .select({ id: series.id })
        .from(series)
        .where(
          and(
            eq(series.publicationStatus, "published"),
            notInArray(series.id, excludedIds)
          )
        )
        .orderBy(
          desc(series.ratingScore),
          desc(series.viewCount),
          desc(series.releaseDate)
        )
        .limit(limit - finalIds.length);

      finalIds.push(...backfill.map((b) => b.id));
    }

    if (finalIds.length === 0) return [];

    // 4. Hydrate full series details
    const seriesRows = await db
      .select({
        id: series.id,
        title: series.title,
        slug: series.slug,
        description: series.description,
        shortTeaser: series.shortTeaser,
        releaseDate: series.releaseDate,
        rating: series.rating,
        ratingScore: series.ratingScore,
      })
      .from(series)
      .where(inArray(series.id, finalIds));

    // 5. Hydrate posters
    const posters = await db
      .select({
        contentId: mediaAssets.contentId,
        url: mediaAssets.url,
      })
      .from(mediaAssets)
      .where(
        and(
          inArray(mediaAssets.contentId, finalIds),
          eq(mediaAssets.type, "poster")
        )
      );

    // 6. Hydrate genres
    const itemGenres = await db
      .select({
        seriesId: seriesGenres.seriesId,
        genreName: genres.name,
      })
      .from(seriesGenres)
      .innerJoin(genres, eq(seriesGenres.genreId, genres.id))
      .where(inArray(seriesGenres.seriesId, finalIds));

    // 7. Hydrate seasons count
    const seasonCounts = await db
      .select({
        seriesId: seasons.seriesId,
        count: sql<number>`count(${seasons.id})::int`,
      })
      .from(seasons)
      .where(inArray(seasons.seriesId, finalIds))
      .groupBy(seasons.seriesId);

    const posterMap = new Map<string, string>();
    for (const p of posters) {
      if (p.contentId && !posterMap.has(p.contentId)) {
        posterMap.set(p.contentId, p.url);
      }
    }

    const genreMap = new Map<string, string[]>();
    for (const g of itemGenres) {
      if (!genreMap.has(g.seriesId)) {
        genreMap.set(g.seriesId, []);
      }
      genreMap.get(g.seriesId)!.push(g.genreName);
    }

    const seasonsMap = new Map<string, number>();
    for (const sc of seasonCounts) {
      if (sc.seriesId) {
        seasonsMap.set(sc.seriesId, Number(sc.count));
      }
    }

    const seriesMap = new Map(seriesRows.map((s) => [s.id, s]));

    // Preserve the matched ranking order
    return finalIds
      .map((id) => {
        const item = seriesMap.get(id);
        if (!item) return null;
        const gList = genreMap.get(id) || [];
        return {
          ...item,
          imageUrl: posterMap.get(id) || null,
          genre: gList[0] || "TV Series",
          primaryGenre: gList[0] || "TV Series",
          genres: gList,
          seasonsCount: seasonsMap.get(id) || null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  } catch (e) {
    console.error("Error in getRelatedSeries:", e);
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

      (s as any).seasons = await getSeriesEpisodes(s.id);
    }
    return s;
  } catch (error: any) {
    console.error("Database connection failed (getAdminSeriesById).", error.message);
    return null;
  }
}



export async function getFeaturedMovies(limit = 5) {
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
        ratingScore: movies.ratingScore,
        genre: genres.name,
      })
      .from(movies)
      .leftJoin(movieGenres, eq(movies.id, movieGenres.movieId))
      .leftJoin(genres, eq(movieGenres.genreId, genres.id))
      .where(eq(movies.publicationStatus, "published"))
      .orderBy(desc(movies.ratingScore), desc(movies.viewCount)) // Specific pattern: Best rated + most viewed
      .limit(limit * 3); 

    const movieMap = new Map<string, any>();
    for (const row of result) {
      if (!movieMap.has(row.id)) {
        movieMap.set(row.id, {
          ...row,
          genres: row.genre ? [row.genre] : [],
        });
      } else {
        if (row.genre) movieMap.get(row.id).genres.push(row.genre);
      }
    }

    const uniqueMovies = Array.from(movieMap.values()).slice(0, limit);
    if (uniqueMovies.length > 0) {
      const ids = uniqueMovies.map(m => m.id);
      const media = await db.select().from(mediaAssets).where(inArray(mediaAssets.contentId, ids));
      for (const m of uniqueMovies) {
        const itemMedia = media.filter(mediaObj => mediaObj.contentId === m.id);
        const poster = itemMedia.find(mediaObj => mediaObj.type === 'poster');
        const backdrop = itemMedia.find(mediaObj => mediaObj.type === 'backdrop');
        m.imageUrl = poster?.url || null;
        m.backdropUrl = backdrop?.url || null;
      }
    }
    return uniqueMovies;
  } catch (error: any) {
    console.error("Database connection failed (getFeaturedMovies).", error.message);
    return [];
  }
}

export async function getPopularSeries(limit = 10) {
  try {
    const result = await db
      .select({
        id: series.id,
        title: series.title,
        slug: series.slug,
        description: series.description,
        shortTeaser: series.shortTeaser,
        releaseDate: series.releaseDate,
        rating: series.rating,
        ratingScore: series.ratingScore,
        viewCount: series.viewCount,
        genre: genres.name,
      })
      .from(series)
      .leftJoin(seriesGenres, eq(series.id, seriesGenres.seriesId))
      .leftJoin(genres, eq(seriesGenres.genreId, genres.id))
      .where(eq(series.publicationStatus, "published"))
      .orderBy(desc(series.viewCount), desc(series.createdAt))
      .limit(limit * 3);

    const seriesMap = new Map<string, any>();
    for (const row of result) {
      if (!seriesMap.has(row.id)) {
        seriesMap.set(row.id, {
          ...row,
          genres: row.genre ? [row.genre] : [],
          type: 'series' as const,
        });
      } else {
        if (row.genre) seriesMap.get(row.id).genres.push(row.genre);
      }
    }

    const uniqueSeries = Array.from(seriesMap.values()).slice(0, limit);
    if (uniqueSeries.length > 0) {
      const ids = uniqueSeries.map(s => s.id);
      const media = await db.select().from(mediaAssets).where(
        and(inArray(mediaAssets.contentId, ids), eq(mediaAssets.contentType, 'series'))
      );
      for (const s of uniqueSeries) {
        const itemMedia = media.filter(mediaObj => mediaObj.contentId === s.id);
        const poster = itemMedia.find(mediaObj => mediaObj.type === 'poster');
        const backdrop = itemMedia.find(mediaObj => mediaObj.type === 'backdrop');
        s.imageUrl = poster?.url || null;
        s.backdropUrl = backdrop?.url || null;
      }
    }
    return uniqueSeries;
  } catch (error: any) {
    console.error("Database connection failed (getPopularSeries).", error.message);
    return [];
  }
}

/**
 * Gets top featured blockbuster movies and series for the cinematic Hero Carousel.
 */
export async function getFeaturedContent(limit = 5) {
  try {
    const [featMovies, popSeries] = await Promise.all([
      getFeaturedMovies(limit),
      getPopularSeries(limit),
    ]);

    const combined = [
      ...featMovies.map(m => ({ ...m, type: 'movie' as const })),
      ...popSeries.map(s => ({ ...s, type: 'series' as const })),
    ].sort((a, b) => {
      const scoreA = (a.ratingScore || 80) * 10 + (a.viewCount || 0);
      const scoreB = (b.ratingScore || 80) * 10 + (b.viewCount || 0);
      return scoreB - scoreA;
    });

    return combined.slice(0, limit);
  } catch (error: any) {
    console.error("Database connection failed (getFeaturedContent).", error.message);
    return [];
  }
}

/**
 * Gets the Top 10 most viewed movies & series for the Netflix-style Top 10 row.
 */
export async function getTrendingContent(limit = 10) {
  try {
    const [trendMovies, popSeries] = await Promise.all([
      getTrendingMovies(limit),
      getPopularSeries(limit),
    ]);

    const combined = [
      ...trendMovies.map(m => ({ ...m, type: 'movie' as const })),
      ...popSeries.map(s => ({ ...s, type: 'series' as const })),
    ].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));

    return combined.slice(0, limit);
  } catch (error: any) {
    console.error("Database connection failed (getTrendingContent).", error.message);
    return [];
  }
}

/**
 * Retrieves a person (actor/filmmaker) by slug or UUID along with their complete
 * filmography of published movies and TV series.
 */
export async function getPersonWithFilmography(slugOrId: string) {
  try {
    const rawSlug = decodeURIComponent(slugOrId).trim().toLowerCase();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawSlug);
    let person: { id: string; name: string; bio: string | null; imageUrl: string | null } | null = null;

    if (isUuid) {
      const rows = await db.select().from(people).where(eq(people.id, rawSlug)).limit(1);
      person = rows[0] || null;
    }

    if (!person) {
      const nameGuess = rawSlug.replace(/-/g, " ");
      const candidates = await db
        .select()
        .from(people)
        .where(ilike(people.name, `%${nameGuess}%`))
        .limit(25);

      person =
        candidates.find((p) => slugify(p.name) === rawSlug) ||
        candidates.find((p) => p.name.toLowerCase() === nameGuess.toLowerCase()) ||
        candidates[0] ||
        null;

      if (!person) {
        const allPeople = await db.select().from(people).limit(2000);
        person = allPeople.find((p) => slugify(p.name) === rawSlug) || null;
      }
    }

    if (!person) return null;

    // Fetch movie credits (published only)
    const movieCredits = await db
      .select({
        id: movies.id,
        title: movies.title,
        slug: movies.slug,
        description: movies.description,
        shortTeaser: movies.shortTeaser,
        releaseDate: movies.releaseDate,
        rating: movies.rating,
        ratingScore: movies.ratingScore,
        viewCount: movies.viewCount,
        runtime: movies.runtime,
        roleName: movieCast.roleName,
        order: movieCast.order,
      })
      .from(movieCast)
      .innerJoin(movies, eq(movieCast.movieId, movies.id))
      .where(and(eq(movieCast.personId, person.id), eq(movies.publicationStatus, "published")))
      .orderBy(desc(movies.releaseDate), desc(movies.viewCount));

    // Fetch series credits (published only)
    const seriesCredits = await db
      .select({
        id: series.id,
        title: series.title,
        slug: series.slug,
        description: series.description,
        shortTeaser: series.shortTeaser,
        releaseDate: series.releaseDate,
        rating: series.rating,
        ratingScore: series.ratingScore,
        viewCount: series.viewCount,
        roleName: seriesCast.roleName,
        order: seriesCast.order,
      })
      .from(seriesCast)
      .innerJoin(series, eq(seriesCast.seriesId, series.id))
      .where(and(eq(seriesCast.personId, person.id), eq(series.publicationStatus, "published")))
      .orderBy(desc(series.releaseDate), desc(series.viewCount));

    // Hydrate movie media and genres
    const movieIds = movieCredits.map((m) => m.id);
    let movieMedia: any[] = [];
    let movieGenresList: any[] = [];
    if (movieIds.length > 0) {
      [movieMedia, movieGenresList] = await Promise.all([
        db.select().from(mediaAssets).where(and(inArray(mediaAssets.contentId, movieIds), eq(mediaAssets.type, "poster"))),
        db.select({ movieId: movieGenres.movieId, genreName: genres.name }).from(movieGenres).innerJoin(genres, eq(movieGenres.genreId, genres.id)).where(inArray(movieGenres.movieId, movieIds)),
      ]);
    }

    const moviePosterMap = new Map<string, string>();
    for (const m of movieMedia) {
      if (!moviePosterMap.has(m.contentId)) moviePosterMap.set(m.contentId, m.url);
    }

    const movieGenreMap = new Map<string, string[]>();
    for (const g of movieGenresList) {
      if (!movieGenreMap.has(g.movieId)) movieGenreMap.set(g.movieId, []);
      movieGenreMap.get(g.movieId)!.push(g.genreName);
    }

    const enrichedMovies = movieCredits.map((m) => {
      const gList = movieGenreMap.get(m.id) || [];
      return {
        ...m,
        type: "movie" as const,
        imageUrl: moviePosterMap.get(m.id) || null,
        primaryGenre: gList[0] || "Movie",
        genres: gList,
      };
    });

    // Hydrate series media, genres, and season counts
    const seriesIds = seriesCredits.map((s) => s.id);
    let seriesMedia: any[] = [];
    let seriesGenresList: any[] = [];
    let seriesSeasonCounts: any[] = [];
    if (seriesIds.length > 0) {
      [seriesMedia, seriesGenresList, seriesSeasonCounts] = await Promise.all([
        db.select().from(mediaAssets).where(and(inArray(mediaAssets.contentId, seriesIds), eq(mediaAssets.type, "poster"))),
        db.select({ seriesId: seriesGenres.seriesId, genreName: genres.name }).from(seriesGenres).innerJoin(genres, eq(seriesGenres.genreId, genres.id)).where(inArray(seriesGenres.seriesId, seriesIds)),
        db.select({ seriesId: seasons.seriesId, count: count(seasons.id) }).from(seasons).where(inArray(seasons.seriesId, seriesIds)).groupBy(seasons.seriesId),
      ]);
    }

    const seriesPosterMap = new Map<string, string>();
    for (const m of seriesMedia) {
      if (!seriesPosterMap.has(m.contentId)) seriesPosterMap.set(m.contentId, m.url);
    }

    const seriesGenreMap = new Map<string, string[]>();
    for (const g of seriesGenresList) {
      if (!seriesGenreMap.has(g.seriesId)) seriesGenreMap.set(g.seriesId, []);
      seriesGenreMap.get(g.seriesId)!.push(g.genreName);
    }

    const seriesSeasonMap = new Map<string, number>();
    for (const sc of seriesSeasonCounts) {
      if (sc.seriesId) seriesSeasonMap.set(sc.seriesId, Number(sc.count));
    }

    const enrichedSeries = seriesCredits.map((s) => {
      const gList = seriesGenreMap.get(s.id) || [];
      return {
        ...s,
        type: "series" as const,
        imageUrl: seriesPosterMap.get(s.id) || null,
        primaryGenre: gList[0] || "TV Series",
        genres: gList,
        seasonsCount: seriesSeasonMap.get(s.id) || null,
      };
    });

    return {
      person,
      movies: enrichedMovies,
      series: enrichedSeries,
      totalCredits: enrichedMovies.length + enrichedSeries.length,
    };
  } catch (error: any) {
    console.error("Error in getPersonWithFilmography:", error.message);
    return null;
  }
}

/**
 * Returns all distinct cast and crew members who have published movie or series credits,
 * for generating XML sitemaps and programmatic directory links.
 */
export async function getAllCastMembers() {
  try {
    const moviePeople = await db
      .select({ id: people.id, name: people.name, imageUrl: people.imageUrl })
      .from(people)
      .innerJoin(movieCast, eq(people.id, movieCast.personId))
      .innerJoin(movies, eq(movieCast.movieId, movies.id))
      .where(eq(movies.publicationStatus, "published"));

    const seriesPeople = await db
      .select({ id: people.id, name: people.name, imageUrl: people.imageUrl })
      .from(people)
      .innerJoin(seriesCast, eq(people.id, seriesCast.personId))
      .innerJoin(series, eq(seriesCast.seriesId, series.id))
      .where(eq(series.publicationStatus, "published"));

    const uniqueMap = new Map<string, { id: string; name: string; imageUrl: string | null }>();
    for (const p of [...moviePeople, ...seriesPeople]) {
      if (!uniqueMap.has(p.id)) {
        uniqueMap.set(p.id, p);
      }
    }

    return Array.from(uniqueMap.values());
  } catch (e: any) {
    console.error("Error in getAllCastMembers:", e.message);
    return [];
  }
}


