import { fetchCatalogItems, fetchCatalogTotalCount, fetchCatalogSpotlightItem } from "@/features/content/catalog.actions";
import { CatalogGrid } from "@/components/content/CatalogGrid";
import { ContentFilters } from "@/components/content/ContentFilters";
import { CatalogSpotlight } from "@/components/content/CatalogSpotlight";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

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

const PAGE_SIZE = 12;

export default async function MoviesIndexPage({
  searchParams,
}: {
  searchParams: { page?: string; genre?: string; sort?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const genre = searchParams.genre;
  const sort = searchParams.sort;

  const [movies, totalCount, fallbackSpotlight] = await Promise.all([
    fetchCatalogItems("movie", page, PAGE_SIZE, genre, sort),
    fetchCatalogTotalCount("movie", genre),
    fetchCatalogSpotlightItem("movie"),
  ]);
  const spotlightMovie = movies.find(m => Boolean(m.backdropUrl)) || movies[0] || fallbackSpotlight;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="w-full relative pb-24 space-y-8">
      {/* 1. Full-Bleed Top Billboard Spotlight (when browsing all movies) */}
      {spotlightMovie ? (
        <CatalogSpotlight
          item={spotlightMovie}
          type="movie"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: genre && genre !== "All" ? `${genre} Movies` : "Movies" },
          ]}
        />
      ) : (
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 pt-3 sm:pt-4 md:pt-5">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: genre && genre !== "All" ? `${genre} Movies` : "Movies" },
            ]}
          />
        </div>
      )}

      {/* 2. Main Content Container */}
      <div id="catalog-content" className={`w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 space-y-8 ${!spotlightMovie ? "pt-2" : ""}`}>
        {/* Catalog Header & Controls Bar */}
        <div className="space-y-4 pb-4 border-b border-white/5 relative z-40">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {genre && genre !== "All" ? `${genre} Movies` : "All Movies"}
              </h1>
              <p className="text-sm sm:text-base text-muted mt-1 max-w-xl">
                Explore critically acclaimed blockbusters, indie gems, and high-definition cinema releases.
              </p>
            </div>
          </div>

          {/* 3. Horizontal Genre Pills & Sorting Toolbar */}
          <ContentFilters type="movies" totalCount={totalCount} />
        </div>

        {/* 4. Responsive Netflix / IMDb Style Cards Grid */}
        <CatalogGrid
          initialItems={movies}
          type="movie"
          genre={genre}
          sort={sort}
          currentPage={page}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
        />
      </div>
    </div>
  );
}
