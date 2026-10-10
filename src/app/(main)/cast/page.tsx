import { getAllCastMembers } from "@/features/content/content.service";
import { slugify } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CastFilters } from "@/components/content/CastFilters";
import { CastGrid } from "@/components/content/CastGrid";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export function generateMetadata({
  searchParams,
}: {
  searchParams?: { page?: string; rating?: string; letter?: string };
}): Metadata {
  const pageStr = searchParams?.page && parseInt(searchParams.page, 10) > 1
    ? ` - Page ${searchParams.page}`
    : "";
  const letterStr = searchParams?.letter && searchParams.letter !== "All"
    ? ` (${searchParams.letter})`
    : "";

  return {
    title: { absolute: `Cast & Crew Directory${letterStr}${pageStr} | Kineos` },
    description:
      "Explore the complete roster of actors, directors, and filmmakers across Kineos. Discover their full filmographies, filter by rating, and stream their movies and TV series in HD.",
    alternates: {
      canonical: "https://www.kineos.fun/cast",
    },
    openGraph: {
      title: "Cast & Crew Directory | Kineos",
      description: "Browse top actors and filmmakers on Kineos.",
      url: "https://www.kineos.fun/cast",
      siteName: "Kineos",
    },
  };
}

export default async function CastDirectoryPage({
  searchParams,
}: {
  searchParams?: {
    page?: string;
    rating?: string;
    sort?: string;
    letter?: string;
    q?: string;
  };
}) {
  const allCast = await getAllCastMembers();

  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
  const ratingParam = searchParams?.rating || "All Ratings";
  const sortParam = searchParams?.sort || "A - Z (Alphabetical)";
  const letterParam = searchParams?.letter || "All";
  const queryParam = (searchParams?.q || "").trim().toLowerCase();

  // 1. Filter by Rating
  let filtered = allCast;
  if (ratingParam.includes("8")) {
    filtered = filtered.filter((c) => c.highestRating !== null && c.highestRating >= 8.0);
  } else if (ratingParam.includes("7")) {
    filtered = filtered.filter((c) => c.highestRating !== null && c.highestRating >= 7.0);
  } else if (ratingParam.includes("6")) {
    filtered = filtered.filter((c) => c.highestRating !== null && c.highestRating >= 6.0);
  }

  // 2. Filter by Alphabet Letter
  if (letterParam && letterParam !== "All") {
    filtered = filtered.filter((c) =>
      c.name.trim().toUpperCase().startsWith(letterParam.toUpperCase())
    );
  }

  // 3. Filter by Search Query
  if (queryParam) {
    filtered = filtered.filter((c) =>
      c.name.toLowerCase().includes(queryParam)
    );
  }

  // 4. Sort (Default is A - Z Alphabetical)
  filtered = [...filtered];
  if (sortParam === "Z - A") {
    filtered.sort((a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: "base" }));
  } else if (sortParam === "Highest Rating") {
    filtered.sort(
      (a, b) =>
        (b.highestRating || 0) - (a.highestRating || 0) ||
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  } else if (sortParam === "Most Credits") {
    filtered.sort(
      (a, b) =>
        b.totalCredits - a.totalCredits ||
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  } else {
    // Default: Alphabetical (A - Z)
    filtered.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }

  // 5. Pagination calculations
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedList = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kineos.fun";

  // Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Kineos Cast & Crew Directory",
    description: "A directory of prominent actors and filmmakers featured on Kineos.",
    numberOfItems: totalCount,
    itemListElement: paginatedList.map((c, index) => ({
      "@type": "ListItem",
      position: (currentPage - 1) * PAGE_SIZE + index + 1,
      item: {
        "@type": "Person",
        name: c.name,
        url: `${siteUrl}/cast/${slugify(c.name)}`,
        image: c.imageUrl || undefined,
      },
    })),
  };

  return (
    <div className="w-full min-h-screen pb-24">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="w-full relative bg-background border-b border-white/5 pt-3 sm:pt-4 md:pt-5 pb-8 md:pb-10">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 space-y-4">
          {/* Top Left Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Cast & Crew" },
              ...(letterParam && letterParam !== "All"
                ? [{ label: `Letter ${letterParam}` }]
                : []),
            ]}
            className="mb-2"
            includeJsonLd={false}
          />

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-semibold">
              <Sparkles className="w-3 h-3" /> Talent Directory
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Cast &amp; Filmmakers
            </h1>
            <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">
              Browse actors, actresses, and directors featured in Kineos movies and TV series.
              Arranged alphabetically with rating filters, credit counts, and complete filmographies.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        id="cast-catalog-content"
        className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 mt-6 sm:mt-8 space-y-6 sm:space-y-8"
      >
        {/* Interactive Filters: Rating, Sort, Alphabet Quick Ribbon, Search */}
        <CastFilters totalCount={totalCount} />

        {/* Responsive Grid with Badges & Pagination */}
        <CastGrid
          items={paginatedList}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  );
}
