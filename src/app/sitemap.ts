import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { movies, series } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kineos.com';

  // Fetch all published movies
  const allMovies = await db
    .select({ slug: movies.slug, updatedAt: movies.updatedAt })
    .from(movies)
    .where(eq(movies.publicationStatus, "published"))
    .orderBy(desc(movies.updatedAt))
    .limit(50000);

  // Fetch all published series
  const allSeries = await db
    .select({ slug: series.slug, updatedAt: series.updatedAt })
    .from(series)
    .where(eq(series.publicationStatus, "published"))
    .orderBy(desc(series.updatedAt))
    .limit(50000);

  const movieEntries: MetadataRoute.Sitemap = allMovies.map((movie) => ({
    url: `${BASE_URL}/movies/${movie.slug}`,
    lastModified: movie.updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const seriesEntries: MetadataRoute.Sitemap = allSeries.map((s) => ({
    url: `${BASE_URL}/series/${s.slug}`,
    lastModified: s.updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/movies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/series`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...movieEntries,
    ...seriesEntries,
  ];
}
