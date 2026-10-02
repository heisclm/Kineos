import { MetadataRoute } from 'next';
import { getLatestMovies } from '@/features/content/content.service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch up to 1000 latest movies for the sitemap
  const movies = await getLatestMovies(1000);

  const movieEntries: MetadataRoute.Sitemap = movies.map((movie) => ({
    url: `https://kineos.com/movies/${movie.slug}`,
    lastModified: movie.updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: 'https://kineos.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://kineos.com/search',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...movieEntries,
  ];
}
