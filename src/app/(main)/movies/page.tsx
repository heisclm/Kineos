import { fetchCatalogItems } from "@/features/content/catalog.actions";
import { CatalogGrid } from "@/components/content/CatalogGrid";
import { ContentFilters } from "@/components/content/ContentFilters";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movies",
  description: "Browse our curated collection of movies on Kineos. Stream and download blockbuster hits, action thrillers, and drama releases in high definition.",
  keywords: [
    "movies",
    "watch movies online",
    "download HD movies",
    "stream movies free",
    "latest movies",
    "popular movies",
    "action movies",
    "comedy movies",
    "Kineos movies"
  ],
  alternates: {
    canonical: "https://www.kineos.fun/movies",
  },
  openGraph: {
    title: "Movies | Kineos",
    description: "Browse our curated collection of movies on Kineos. Stream and download blockbuster hits, action thrillers, and drama releases in high definition.",
    url: "https://www.kineos.fun/movies",
    siteName: "Kineos",
    type: "website",
  },
};

export default async function MoviesIndexPage({
  searchParams,
}: {
  searchParams: { genre?: string; sort?: string };
}) {
  const genre = searchParams.genre;
  const sort = searchParams.sort;

  let movies = await fetchCatalogItems("movie", 1, 30, genre, sort);

  

  return (
    <div className="w-full relative pb-24 space-y-12 max-w-[1920px] mx-auto pt-8 px-6 md:px-10">
      
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">Movies</h1>
          <p className="text-lg text-muted max-w-xl">
            Explore our curated collection of critically acclaimed films, blockbuster hits, and hidden gems.
          </p>
        </div>
        
        <ContentFilters type="movies" />
      </div>

      <div className="w-full py-2 flex justify-center">
        
      </div>

      <CatalogGrid
        key={`${genre || 'all'}-${sort || 'latest'}`}
        initialItems={movies} 
        type="movie" 
        genre={genre}
        sort={sort}
      />
    </div>
  );
}
