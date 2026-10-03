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
import { AdSlot } from "@/components/ui/AdSlot";

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.description,
    dateCreated: movie.releaseDate,
    url: `https://kineos.com/movies/${movie.slug}`,
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
      <div className="w-full relative bg-surface-overlay border-b border-white/5">
        <div className="w-full h-[50vh] md:h-[60vh] min-h-[400px] md:min-h-[500px] relative">
           <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10 h-full" />
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
        </div>
        
        <div className="relative z-20 max-w-[1920px] mx-auto px-6 md:px-10 -mt-32 md:-mt-48 pb-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-end">
            
            {(movie as any).imageUrl && (
              <div className="w-40 md:w-64 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/10 relative z-30">
                <Image src={(movie as any).imageUrl} alt={movie.title} fill className="object-cover" />
              </div>
            )}
            
            <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-[1.1] tracking-tight text-balance drop-shadow-lg">
                 {movie.title}
               </h1>
               
               <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-6 text-sm font-medium text-muted drop-shadow-md">
                 <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" strokeWidth={2} /> {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA'}</span>
                 <span className="text-muted-foreground/30">&bull;</span>
                 <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" strokeWidth={2} /> {formatDuration(movie.runtime)}</span>
                     <span className="text-muted-foreground/30">&bull;</span>
                 <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-primary text-primary" strokeWidth={2} /> {movie.rating || 'NR'}</span>
               </div>
               
               <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl drop-shadow-sm line-clamp-2 md:line-clamp-3">
                 {(movie as any).shortTeaser || movie.description}
               </p>

               <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                  <Button size="lg" className="rounded-pill px-8 gap-2 font-semibold bg-primary text-primary-foreground hover:scale-105 transition-apple shadow-lg border border-primary/20">
                     <Play className="w-4 h-4" fill="currentColor" /> Watch Trailer
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Leaderboard Ad */}
      <div className="w-full flex justify-center py-8 px-6 md:px-10 max-w-[1920px] mx-auto relative z-20">
        <AdSlot format="leaderboard" slotId="movie_top_leaderboard" />
      </div>

      {/* Content Body */}
      <div className="mt-4 px-6 md:px-10 max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 xl:col-span-9 space-y-12">

          {movie.description && (
            <section className="mb-12">
              <h3 className="text-2xl font-bold tracking-tight text-foreground mb-4">Storyline</h3>
              <div className="p-6 rounded-2xl bg-surface border border-white/5 shadow-sm text-muted-foreground leading-relaxed">
                {movie.description}
              </div>
            </section>
          )}

           {cast.length > 0 && (
             <section>
               <h3 className="text-2xl font-bold tracking-tight text-foreground mb-6">Top Cast</h3>
               <div className="flex flex-wrap gap-3">
                 {cast.map((c: any) => (
                   <div key={c.name} className="flex items-center gap-3 p-2 pr-6 rounded-full bg-surface border border-white/5 shadow-sm hover:bg-surface-elevated transition-apple cursor-default">
                     {c.imageUrl ? (
                       <Image src={c.imageUrl} alt={c.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                     ) : (
                       <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground font-semibold border border-white/10">
                         {c.name.charAt(0)}
                       </div>
                     )}
                     <div className="flex flex-col">
                       <span className="text-sm font-semibold text-foreground">{c.name}</span>
                       <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{c.role || 'Actor'}</span>
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
             <AdSlot format="banner" slotId="movie_download_bottom" />
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
           <AdSlot format="rectangle" slotId="movie_sidebar_rect" />
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
