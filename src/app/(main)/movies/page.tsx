import { fetchCatalogItems } from "@/features/content/catalog.actions";
import { CatalogGrid } from "@/components/content/CatalogGrid";
import { ContentFilters } from "@/components/content/ContentFilters";
import { CatalogSpotlight } from "@/components/content/CatalogSpotlight";

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

  const movies = await fetchCatalogItems("movie", 1, 30, genre, sort);
  const spotlightMovie = movies.length > 0 ? movies[0] : null;

  return (
    <div className="w-full relative pb-24 space-y-8">
      {/* 1. Full-Bleed Top Billboard Spotlight (when browsing all movies) */}
      {spotlightMovie && (
        <CatalogSpotlight item={spotlightMovie} type="movie" />
      )}

      {/* 2. Main Content Container */}
      <div className={`w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 space-y-8 ${!spotlightMovie ? "pt-6" : ""}`}>
        {/* Catalog Header & Controls Bar */}
        <div className="space-y-4 pb-4 border-b border-white/5 relative z-30">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {genre && genre !== "All" ? `${genre} Movies` : "All Movies"}
              </h1>
              <p className="text-sm sm:text-base text-muted mt-1 max-w-xl">
                Explore critically acclaimed blockbusters, indie gems, and high-definition cinema releases.
              </p>
            </div>
            <span className="text-xs font-semibold text-white/50 self-start sm:self-auto">
              {movies.length} {movies.length === 1 ? "Title" : "Titles"} Available
            </span>
          </div>

          {/* 3. Horizontal Genre Pills & Sorting Toolbar */}
          <ContentFilters type="movies" totalCount={movies.length} />
        </div>

        {/* 4. Responsive Netflix / IMDb Style Cards Grid */}
        <CatalogGrid
          initialItems={movies}
          type="movie"
          genre={genre}
          sort={sort}
        />
      </div>
    </div>
  );
}
