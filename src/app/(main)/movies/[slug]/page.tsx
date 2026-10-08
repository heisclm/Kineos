import { getMovieBySlug, getDownloadSourcesForContent, getCastForContent, getRelatedMovies } from "@/features/content/content.service";
import { MovieCard } from "@/components/movie/MovieCard";
import Image from "next/image";
import { notFound } from "next/navigation";
import { formatDuration } from "@/lib/utils";
// from "next/navigation";
import { Play, Download, Clock, Calendar, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DownloadSourceList } from "@/components/content/DownloadSourceList";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import { generateMovieKeywords } from "@/lib/seo";

import type { Metadata, ResolvingMetadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const movie = await getMovieBySlug(params.slug);
  
  if (!movie) {
    return { title: 'Movie Not Found' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kineos.fun';
  const poster = (movie as any).imageUrl || null;
  const backdrop = (movie as any).backdropUrl || null;
  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;

  const title = movie.seoTitle
    ? movie.seoTitle
    : releaseYear
      ? `${movie.title} (${releaseYear})`
      : movie.title;

  const summary = movie.shortTeaser || movie.description || "";
  const description = movie.seoDescription || (
    summary
      ? `${summary.slice(0, 105).trimEnd()}${summary.length > 105 ? "…" : ""} Cast, release details, and more on Kineos.`
      : `Explore ${movie.title}: synopsis, cast, release information, ratings, and available sources on Kineos.`
  );

  const cast = await getCastForContent(movie.id, "movie").catch(() => []);
  const keywords = generateMovieKeywords({
    title: movie.title,
    releaseDate: movie.releaseDate,
    genres: (movie as any).genres,
    cast: cast.map((c: any) => c.name),
  });

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${siteUrl}/movies/${movie.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/movies/${movie.slug}`,
      siteName: "Kineos",
      type: "video.movie",
      images: (poster || backdrop) ? [
        {
          url: poster || backdrop,
          width: 1200,
          height: 630,
          alt: movie.title,
        }
      ] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: (poster || backdrop) ? [poster || backdrop] : undefined,
    },
  };
}

export default async function MovieDetailPage({ params }: { params: { slug: string } }) {
  let movie = await getMovieBySlug(params.slug);

  if (!movie) {
    notFound();
  }

  // downloads can be empty for mock items
  const downloads = await getDownloadSourcesForContent(movie.id, "movie").catch(() => []);
  const cast = await getCastForContent(movie.id, "movie").catch(() => []);
  const relatedMovies = await getRelatedMovies(movie.id, 5).catch(() => []);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kineos.fun';
  const backdrop = (movie as any).backdropUrl || (movie as any).imageUrl || null;
  const poster = (movie as any).imageUrl || null;
  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;

  const pageKeywords = generateMovieKeywords({
    title: movie.title,
    releaseDate: movie.releaseDate,
    genres: (movie as any).genres,
    cast: cast.map((c: any) => c.name),
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Movie",
        "@id": `${siteUrl}/movies/${movie.slug}#movie`,
        name: movie.title,
        description: movie.description,
        dateCreated: movie.releaseDate,
        image: poster || backdrop || undefined,
        url: `${siteUrl}/movies/${movie.slug}`,
        genre: (movie as any).genres || [],
        keywords: pageKeywords.join(", "),
        director: cast.filter((c: any) => c.role === 'director').map((c: any) => ({
          "@type": "Person",
          name: c.name
        })),
        actor: cast.filter((c: any) => c.role === 'actor').map((c: any) => ({
          "@type": "Person",
          name: c.name
        })),
        aggregateRating: movie.ratingScore ? {
          "@type": "AggregateRating",
          ratingValue: movie.ratingScore / 10,
          bestRating: "10",
          ratingCount: movie.viewCount || 100
        } : undefined
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/movies/${movie.slug}#breadcrumb`,
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
            name: "Movies",
            item: `${siteUrl}/movies`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: movie.title,
            item: `${siteUrl}/movies/${movie.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full relative pb-24">
      {/* View Tracking */}
      <ViewTracker id={movie.id} type="movie" />
      
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Movie Hero/Backdrop Layer */}
      <div className="w-full relative bg-background overflow-hidden">
        {/* Backdrop Background */}
        <div className="absolute inset-0 z-0">
          {(movie as any).backdropUrl || (movie as any).imageUrl ? (
            <Image 
              src={(movie as any).backdropUrl || (movie as any).imageUrl}
              alt={movie.title}
              fill
              className="object-cover object-top opacity-35 md:opacity-45"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 via-transparent to-transparent opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent/30" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 pt-20 md:pt-24 lg:pt-28 pb-8 md:pb-12">
          
          {/* Mobile Layout (< md): Genres aligned with poster top, Title full-width */}
          <div className="md:hidden flex flex-col gap-3">
            {/* Top Row: Poster & Aligned Header Info */}
            <div className="flex gap-4 items-start">
              {(movie as any).imageUrl && (
                <div className="w-28 sm:w-32 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/15 bg-surface relative">
                  <Image src={(movie as any).imageUrl} alt={movie.title} fill className="object-cover" priority />
                </div>
              )}

              {/* Right Column: Badges (in line with poster top), Meta Row, Quick Action */}
              <div className="flex-1 flex flex-col justify-start min-w-0 pt-0.5">
                {/* Badges in line with top of poster */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                  <Badge variant="glass" className="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-primary/25 text-primary border-primary/30">
                    MOVIE
                  </Badge>
                  {((movie as any).genres || []).slice(0, 3).map((g: string) => (
                    <Badge key={g} variant="glass" className="px-2 py-0.5 text-[10px] font-medium bg-white/10 border-white/15 text-white/90">
                      {g}
                    </Badge>
                  ))}
                  {((movie as any).genres || []).length > 3 && (
                    <Badge variant="glass" className="px-1.5 py-0.5 text-[10px] font-medium bg-white/5 border-white/10 text-white/70">
                      +{((movie as any).genres || []).length - 3}
                    </Badge>
                  )}
                </div>

                {/* Mobile Meta Row */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-white/90 drop-shadow-md mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" strokeWidth={2.2} /> {releaseYear || 'TBA'}
                  </span>
                  <span className="text-white/40">&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" strokeWidth={2.2} /> {formatDuration(movie.runtime)}
                  </span>
                  <span className="text-white/40">&bull;</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-primary text-primary" strokeWidth={2.2} /> {movie.rating || 'NR'}
                  </span>
                </div>

                {/* Quick Action Button */}
                <Button size="sm" className="rounded-full px-4 py-1.5 gap-1.5 font-semibold bg-primary text-primary-foreground text-xs shadow-md border border-primary/20 w-fit">
                  <Play className="w-3.5 h-3.5" fill="currentColor" /> Watch Trailer
                </Button>
              </div>
            </div>

            {/* Full-width Title: Gives long titles like Spider-Man full room without awkward hyphen breaks */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-snug tracking-tight text-balance drop-shadow-xl break-normal mt-1">
              {movie.title}
            </h1>

            {/* Teaser Description */}
            {((movie as any).shortTeaser || movie.description) && (
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal line-clamp-3">
                {(movie as any).shortTeaser || movie.description}
              </p>
            )}
          </div>

          {/* Desktop & Tablet Layout (md:flex): Perfectly aligned items-start */}
          <div className="hidden md:flex gap-8 lg:gap-10 items-start w-full">
            {(movie as any).imageUrl && (
              <div className="w-48 lg:w-60 xl:w-68 aspect-[2/3] shrink-0 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/10 relative z-20 bg-surface">
                <Image src={(movie as any).imageUrl} alt={movie.title} fill className="object-cover" priority />
              </div>
            )}

            {/* Content Column: Badges aligned with poster top */}
            <div className="flex-1 text-left min-w-0 pt-1">
              {/* Badges in line with top of poster */}
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <Badge variant="glass" className="px-3 py-1 text-xs font-bold tracking-wider bg-primary/20 text-primary border-primary/25">
                  MOVIE
                </Badge>
                {((movie as any).genres || []).map((g: string) => (
                  <Badge key={g} variant="glass" className="px-3 py-1 text-xs font-medium bg-white/10 border-white/20 text-white/90">
                    {g}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-foreground mb-3 leading-[1.15] tracking-tight text-balance drop-shadow-2xl">
                {movie.title}
              </h1>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm font-semibold text-white/90 drop-shadow-md">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" strokeWidth={2.2} /> {releaseYear || 'TBA'}
                </span>
                <span className="text-white/40">&bull;</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" strokeWidth={2.2} /> {formatDuration(movie.runtime)}
                </span>
                <span className="text-white/40">&bull;</span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-primary text-primary" strokeWidth={2.2} /> {movie.rating || 'NR'}
                </span>
              </div>

              {/* Teaser */}
              {((movie as any).shortTeaser || movie.description) && (
                <p className="text-sm md:text-base lg:text-lg text-white/80 leading-relaxed mb-6 max-w-3xl font-normal drop-shadow-sm line-clamp-3">
                  {(movie as any).shortTeaser || movie.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Button size="lg" className="rounded-full px-8 gap-2 font-semibold bg-primary text-primary-foreground hover:scale-105 transition-apple shadow-lg border border-primary/20">
                  <Play className="w-4 h-4" fill="currentColor" /> Watch Trailer
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>

      

      

      {/* Content Body */}
      <div className="mt-4 px-6 md:px-10 max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 xl:col-span-9 space-y-12">

          {movie.description && (
            <section className="mb-12">
              <h3 className="text-2xl font-bold tracking-tight text-foreground mb-4">Storyline</h3>
              <div className="p-6 md:p-10 rounded-2xl md:rounded-3xl bg-surface/40 backdrop-blur-sm border border-white/5 shadow-inner text-white/70 text-base md:text-lg leading-relaxed md:leading-[1.8] font-medium text-left text-pretty">
                {movie.description}
              </div>
            </section>
          )}

           {cast.length > 0 && (
             <section>
               <h3 className="text-2xl font-bold tracking-tight text-foreground mb-6">Top Cast</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                 {cast.map((c: any) => (
                   <div key={c.name} className="flex items-center gap-3 p-2 pr-4 md:pr-6 rounded-full bg-surface border border-white/5 shadow-sm hover:bg-surface-elevated transition-apple cursor-default overflow-hidden">
                     {c.imageUrl ? (
                       <Image src={c.imageUrl} alt={c.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                     ) : (
                       <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground font-semibold border border-white/10">
                         {c.name.charAt(0)}
                       </div>
                     )}
                     <div className="flex flex-col min-w-0 flex-1">
                       <span className="text-[13px] md:text-sm font-semibold text-foreground truncate">{c.name}</span>
                       <span className="text-[9px] md:text-[11px] text-muted-foreground uppercase tracking-wider font-medium truncate">{c.role || 'Actor'}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </section>
           )}

           <section id="download">
              <DownloadSourceList sources={downloads as any} />
           </section>

           {/* Premium Ad Placement */}
           <div className="pt-4">
             
           </div>
        </div>
        
        <div className="lg:col-span-4 xl:col-span-3 space-y-8">
           <div className="p-8 rounded-xl bg-surface border border-white/5">
              <h3 className="text-lg font-semibold tracking-tight text-foreground mb-6">Movie Info</h3>
              <dl className="space-y-5 text-sm">
                {(movie as any).genres && (movie as any).genres.length > 0 && (
                  <div>
                    <dt className="text-muted mb-1.5">Genres</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {(movie as any).genres.map((g: string) => (
                        <span key={g} className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/90 font-medium">
                          {g}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                {movie.status && (
                  <div>
                    <dt className="text-muted mb-1.5">Status</dt>
                    <dd className="text-foreground font-medium capitalize">{movie.status}</dd>
                  </div>
                )}
                {movie.originalTitle && (
                  <div>
                    <dt className="text-muted mb-1.5">Original Title</dt>
                    <dd className="text-foreground font-medium">{movie.originalTitle}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted mb-1.5">Language</dt>
                  <dd className="text-foreground font-medium">{movie.language || 'English'}</dd>
                </div>
                {movie.country && (
                  <div>
                    <dt className="text-muted mb-1.5">Country</dt>
                    <dd className="text-foreground font-medium">{movie.country}</dd>
                  </div>
                )}
              </dl>
           </div>
           
           {/* Sidebar Rectangle Ad */}
           
        </div>
      </div>

      {/* Related Movies */}
      {relatedMovies && relatedMovies.length > 0 && (
        <div className="w-full px-6 md:px-10 max-w-[1920px] mx-auto mt-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">More Like This</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {relatedMovies.map((m) => (
              <MovieCard
                key={m.id}
                id={m.id}
                title={m.title}
                slug={m.slug}
                description={m.description || ""}
                imageUrl={(m as any).imageUrl || ""}
                primaryGenre={m.genre || "Movie"}
                type="movie"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


