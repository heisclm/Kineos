import { getPersonWithFilmography } from "@/features/content/content.service";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Film, Tv, Sparkles, User, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CastFilmographyView } from "@/components/content/CastFilmographyView";
import type { Metadata, ResolvingMetadata } from "next";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateMetadata(
  props: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(props.params);
  const data = await getPersonWithFilmography(resolvedParams.slug);

  if (!data || !data.person) {
    return {
      title: "Cast Member Not Found | Kineos",
      description: "The requested cast or crew member could not be found on Kineos.",
    };
  }

  const { person, movies, series, totalCredits } = data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kineos.fun";
  const pageUrl = `${siteUrl}/cast/${resolvedParams.slug}`;

  const title = `${person.name} Movies & TV Series - Watch & Download HD | Kineos`;
  const description =
    person.bio ||
    `Explore all ${totalCredits} movies and TV series featuring ${person.name} on Kineos. Watch trailers, discover complete filmographies, and download titles in high definition.`;

  return {
    title,
    description,
    keywords: [
      person.name,
      `${person.name} movies`,
      `${person.name} series`,
      `${person.name} filmography`,
      `${person.name} download`,
      `${person.name} stream`,
      "movies",
      "tv series",
      "Kineos",
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "Kineos",
      images: person.imageUrl
        ? [
            {
              url: person.imageUrl,
              width: 600,
              height: 900,
              alt: person.name,
            },
          ]
        : [],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: person.imageUrl ? [person.imageUrl] : [],
    },
  };
}

export default async function CastDetailPage(props: PageProps) {
  const resolvedParams = await Promise.resolve(props.params);
  const data = await getPersonWithFilmography(resolvedParams.slug);

  if (!data || !data.person) {
    notFound();
  }

  const { person, movies, series, totalCredits } = data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kineos.fun";
  const pageUrl = `${siteUrl}/cast/${resolvedParams.slug}`;

  // Structured Data (Person + Breadcrumbs)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${pageUrl}#person`,
        name: person.name,
        image: person.imageUrl || undefined,
        description:
          person.bio ||
          `Filmography and credits for ${person.name} on Kineos streaming platform.`,
        mainEntityOfPage: pageUrl,
        knowsAbout: [
          ...movies.map((m) => m.title),
          ...series.map((s) => s.title),
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Cast & Crew",
            item: `${siteUrl}/cast`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: person.name,
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full relative pb-24">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header Layer */}
      <div className="w-full relative bg-background overflow-hidden border-b border-white/5">
        {/* Soft Ambient Background Aura */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {person.imageUrl ? (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-15 blur-3xl rounded-full overflow-hidden">
              <Image
                src={person.imageUrl}
                alt=""
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-3xl rounded-full" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 pt-20 md:pt-24 lg:pt-28 pb-10 md:pb-14">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/50 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-white/30" />
            <Link href="/cast" className="hover:text-white transition-colors">
              Cast & Crew
            </Link>
            <ChevronRight className="w-3 h-3 text-white/30" />
            <span className="text-white/90 truncate">{person.name}</span>
          </nav>

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
            {/* Avatar */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden shrink-0 border-2 border-white/15 shadow-2xl bg-surface">
              {person.imageUrl ? (
                <Image
                  src={person.imageUrl}
                  alt={person.name}
                  fill
                  sizes="(max-width: 640px) 112px, 176px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-surface-elevated text-white/40">
                  <User className="w-12 h-12 mb-1" />
                  <span className="text-xs font-semibold">{person.name.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="glass"
                  className="text-[11px] px-3 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-semibold"
                >
                  <Sparkles className="w-3 h-3 mr-1 inline" /> Actor / Filmmaker
                </Badge>
                {movies.length > 0 && (
                  <Badge
                    variant="glass"
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-white/80 border border-white/10 font-medium"
                  >
                    <Film className="w-3 h-3 mr-1 inline" /> {movies.length} {movies.length === 1 ? "Movie" : "Movies"}
                  </Badge>
                )}
                {series.length > 0 && (
                  <Badge
                    variant="glass"
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-white/80 border border-white/10 font-medium"
                  >
                    <Tv className="w-3 h-3 mr-1 inline" /> {series.length} {series.length === 1 ? "Series" : "Series"}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground drop-shadow-md">
                {person.name}
              </h1>

              <p className="text-xs sm:text-sm text-white/70 max-w-3xl leading-relaxed">
                {person.bio ||
                  `Explore the complete filmography of ${person.name} on Kineos. Stream trailers, inspect technical specifications, and download available titles in pristine HD quality.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="mt-8 px-4 sm:px-6 md:px-10 max-w-[1920px] mx-auto">
        <CastFilmographyView
          movies={movies as any}
          series={series as any}
          actorName={person.name}
        />
      </div>
    </div>
  );
}
