import type { Metadata } from "next";
import {
  getFeaturedContent,
  getTrendingContent,
  getLatestMovies,
  getTopRatedMovies,
  getPopularSeries,
} from "@/features/content/content.service";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { TopTenRow } from "@/components/home/TopTenRow";
import { ContentRow } from "@/components/home/ContentRow";

export const metadata: Metadata = {
  title: "Discover Movies & TV Shows",
  description: "Explore movie and TV series details, cast, storylines, release information, and available sources on Kineos.",
  keywords: [
    "Kineos",
    "kineos fun",
    "kineos movies",
    "movie catalog",
    "TV series catalog",
    "new releases",
    "top rated movies",
    "TV series episodes"
  ],
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://www.kineos.fun",
  },
  openGraph: {
    title: "Discover Movies & TV Shows | Kineos",
    description: "Explore movie and TV series details, cast, storylines, release information, and available sources on Kineos.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.kineos.fun",
    siteName: "Kineos",
    type: "website",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Kineos",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Discover Movies & TV Shows | Kineos",
    description: "Explore movie and TV series details, cast, storylines, release information, and available sources on Kineos.",
    images: ["/icon-512.png"],
  },
};

export default async function HomePage() {
  const [featuredContent, trendingContent, newReleases, popularSeries, topRatedMovies] =
    await Promise.all([
      getFeaturedContent(5),
      getTrendingContent(10),
      getLatestMovies(10),
      getPopularSeries(10),
      getTopRatedMovies(10),
    ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kineos",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.kineos.fun",
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.kineos.fun"}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-8 sm:space-y-12 pb-24 w-full max-w-[1920px] mx-auto">
        {/* 1. Cinematic Billboard Hero */}
        <section className="px-0 sm:px-6 md:px-10 sm:pt-4">
          <HeroCarousel movies={featuredContent} />
        </section>

        {/* 2. Netflix-style Top 10 Trending Row (Ranked 1 to 10) */}
        <TopTenRow items={trendingContent} />

        {/* 3. New Cinema Releases */}
        <ContentRow
          title="New Releases"
          subtitle="Recently premiered movies added to the catalog"
          items={newReleases}
          link="/movies"
          type="movie"
          qualityBadge="4K UHD"
        />

        {/* 4. Popular TV Series */}
        <ContentRow
          title="Binge-Worthy TV Series"
          subtitle="Trending multi-season series and episodic entertainment"
          items={popularSeries}
          link="/series"
          type="series"
          qualityBadge="HD"
        />

        {/* 5. IMDb-style Top Rated & Masterworks */}
        <ContentRow
          title="Critically Acclaimed & Top Rated"
          subtitle="Highest-rated masterpieces ranked by critical consensus"
          items={topRatedMovies}
          link="/movies?sort=Rating"
          type="movie"
          qualityBadge="4K UHD"
        />
      </div>
    </>
  );
}
