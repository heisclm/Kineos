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

import type { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  let movie = await getMovieBySlug(params.slug);
  if (!movie) {
  }
  
  if (!movie) {
    return { title: 'Movie Not Found | Kineos' };
  }

  return {
    title: `${movie.seoTitle || movie.title} | Kineos`,
    description: movie.seoDescription || movie.description,
    openGraph: {
      title: movie.title,
      description: movie.description || undefined,
      type: "video.movie",
    },
  };
}

export default async function MovieDetailPage({ params }: { params: { slug: string } }) {
  let movie = await getMovieBySlug(params.slug);
  if (!movie) {
  }

  if (!movie) {
    notFound();
  }

  // downloads can be empty for mock items
  const downloads = await getDownloadSourcesForContent(movie.id, "movie").catch(() => []);
  const cast = await getCastForContent(movie.id, "movie").catch(() => []);
  const relatedMovies = await getRelatedMovies(movie.id, 5).catch(() => []);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kineos.com';
  const backdrop = (movie as any).backdropUrl || (movie as any).imageUrl || null;
  const poster = (movie as any).imageUrl || null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.description,
    dateCreated: movie.releaseDate,
    image: poster || backdrop || undefined,
    url: `${siteUrl}/movies/${movie.slug}`,
    director: cast.filter(c => c.role === 'director').map(c => ({
      "@type": "Person",
      name: c.name
    })),
    actor: cast.filter(c => c.role === 'actor').map(c => ({
      "@type": "Person",
      name: c.name
    })),
    aggregateRating: movie.ratingScore ? {
      "@type": "AggregateRating",
      ratingValue: movie.ratingScore / 10,
      bestRating: "10",
      ratingCount: movie.viewCount || 100
    } : undefined
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
      <div className="w-full relative bg-background">
        <div className="w-full h-[60vh] md:h-[70vh] min-h-[500px] md:min-h-[600px] relative flex flex-col justify-end">
           <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
           <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10 w-2/3" />
           
           {(movie as any).backdropUrl || (movie as any).imageUrl ? (
             <Image 
               src={(movie as any).backdropUrl || (movie as any).imageUrl}
               alt={movie.title}
               fill
               className="object-cover object-top z-0 opacity-40 md:opacity-50 mix-blend-screen"
               priority
             />
           ) : (
             <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 via-transparent to-transparent z-0 opacity-60" />
           )}
           
           <div className="relative z-20 w-full max-w-[1920px] mx-auto px-4 md:px-10 pb-16 md:pb-12 flex gap-6 md:gap-10 items-end">
             
             {(movie as any).imageUrl && (
               <div className="hidden md:block w-40 md:w-64 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative z-30 transform translate-y-12 md:translate-y-24">
                 <Image src={(movie as any).imageUrl} alt={movie.title} fill className="object-cover" />
               </div>
             )}
             
             <div className="flex-1 text-left mt-2 md:mt-0 w-full">
                {/* Mobile Poster (Shown next to title on mobile for premium look) */}
                <div className="md:hidden flex gap-4 items-end mb-4">
                  {(movie as any).imageUrl && (
                    <div className="w-28 aspect-[2/3] shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/10 relative z-30">
                      <Image src={(movie as any).imageUrl} alt={movie.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="pb-1">
                    <h1 className="text-3xl font-bold text-foreground leading-[1.1] tracking-tight text-balance drop-shadow-2xl mb-2">
                      {movie.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/90 drop-shadow-md">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" strokeWidth={2.5} /> {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA'}</span>
                      <span className="text-white/40">&bull;</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" strokeWidth={2.5} /> {formatDuration(movie.runtime)}</span>
                        <span className="text-white/40">&bull;</span>
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-primary text-primary" strokeWidth={2.5} /> {movie.rating || 'NR'}</span>
                    </div>
                  </div>
                </div>

                <h1 className="hidden md:block text-5xl lg:text-7xl font-bold text-foreground mb-4 leading-[1.1] tracking-tight text-balance drop-shadow-2xl">
                  {movie.title}
                </h1>
                
                <div className="hidden md:flex flex-wrap items-center gap-3 mb-6 text-sm font-semibold text-white/90 drop-shadow-md">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" strokeWidth={2.5} /> {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA'}</span>
                  <span className="text-white/40">&bull;</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" strokeWidth={2.5} /> {formatDuration(movie.runtime)}</span>
                  <span className="text-white/40">&bull;</span>
                  <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-primary text-primary" strokeWidth={2.5} /> {movie.rating || 'NR'}</span>
                </div>
                
                <p className="text-sm md:text-lg text-white/90 leading-relaxed mb-6 md:mb-8 max-w-3xl drop-shadow-lg font-medium">
                  {(movie as any).shortTeaser || movie.description}
                </p>
 
                <div className="flex flex-wrap items-center gap-4">
                   <Button size="lg" className="rounded-pill px-8 gap-2 font-semibold bg-primary text-primary-foreground hover:scale-105 transition-apple shadow-lg border border-primary/20">
                      <Play className="w-4 h-4" fill="currentColor" /> Watch Trailer
                   </Button>
                </div>
             </div>
           </div>
        </div>
      </div>
      
      {/* Spacer for desktop poster overlap */}
      <div className="hidden md:block h-16 md:h-24 w-full bg-background" />

      

      {/* Content Body */}
      <div className="mt-4 px-6 md:px-10 max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 xl:col-span-9 space-y-12">

          {movie.description && (
            <section className="mb-12">
              <h3 className="text-2xl font-bold tracking-tight text-foreground mb-4">Storyline</h3>
              <div className="p-8 md:p-10 rounded-2xl md:rounded-3xl bg-surface/80 border border-white/5 shadow-md text-white/80 leading-relaxed text-justify">
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


