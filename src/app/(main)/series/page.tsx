import { fetchCatalogItems, fetchCatalogTotalCount, fetchCatalogSpotlightItem } from "@/features/content/catalog.actions";
import { CatalogGrid } from "@/components/content/CatalogGrid";
import { ContentFilters } from "@/components/content/ContentFilters";
import { CatalogSpotlight } from "@/components/content/CatalogSpotlight";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TV Series",
  description: "Browse trending TV series, full seasons, and episodic releases on Kineos. Stream and download complete shows in high definition.",
  keywords: [
    "TV series",
    "watch series online",
    "download TV shows",
    "stream TV series free",
    "binge watch series",
    "latest TV shows",
    "all seasons episodes",
    "Kineos TV series"
  ],
  alternates: {
    canonical: "https://www.kineos.fun/series",
  },
  openGraph: {
    title: "TV Series | Kineos",
    description: "Browse trending TV series, full seasons, and episodic releases on Kineos. Stream and download complete shows in high definition.",
    url: "https://www.kineos.fun/series",
    siteName: "Kineos",
    type: "website",
  },
};

const PAGE_SIZE = 12;

export default async function SeriesIndexPage({
  searchParams,
}: {
  searchParams: { page?: string; genre?: string; sort?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const genre = searchParams.genre;
  const sort = searchParams.sort;

  const [series, totalCount, fallbackSpotlight] = await Promise.all([
    fetchCatalogItems("series", page, PAGE_SIZE, genre, sort),
    fetchCatalogTotalCount("series", genre),
    fetchCatalogSpotlightItem("series"),
  ]);
  const spotlightSeries = series.find(s => Boolean(s.backdropUrl)) || series[0] || fallbackSpotlight;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="w-full relative pb-24 space-y-8">
      {/* 1. Full-Bleed Top Billboard Spotlight (when browsing all series) */}
      {spotlightSeries ? (
        <CatalogSpotlight
          item={spotlightSeries}
          type="series"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: genre && genre !== "All" ? `${genre} Series` : "TV Series" },
          ]}
        />
      ) : (
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 pt-3 sm:pt-4 md:pt-5">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: genre && genre !== "All" ? `${genre} Series` : "TV Series" },
            ]}
          />
        </div>
      )}

      {/* 2. Main Content Container */}
      <div id="catalog-content" className={`w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 space-y-8 ${!spotlightSeries ? "pt-2" : ""}`}>
        {/* Catalog Header & Controls Bar */}
        <div className="space-y-4 pb-4 border-b border-white/5 relative z-40">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {genre && genre !== "All" ? `${genre} TV Shows` : "All TV Series"}
              </h1>
              <p className="text-sm sm:text-base text-muted mt-1 max-w-xl">
                Binge-worthy drama, limited docuseries, and multi-season episodic entertainment.
              </p>
            </div>
          </div>

          {/* 3. Horizontal Genre Pills & Sorting Toolbar */}
          <ContentFilters type="series" totalCount={totalCount} />
        </div>

        {/* 4. Responsive Netflix / IMDb Style Cards Grid */}
        <CatalogGrid
          initialItems={series}
          type="series"
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
