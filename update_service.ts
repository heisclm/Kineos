import fs from 'fs';

const target = 'src/features/content/content.service.ts';
let content = fs.readFileSync(target, 'utf8');

const featuredFunc = `
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
`;

content = content + '\n' + featuredFunc;
fs.writeFileSync(target, content);
console.log('Added getFeaturedMovies to content.service.ts');
