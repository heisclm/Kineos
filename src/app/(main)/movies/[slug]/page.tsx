import { getMovieBySlug, getDownloadSourcesForContent } from "@/features/content/content.service";
import { notFound } from "next/navigation";
import { Play, Download, Clock, Calendar, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DownloadSourceList } from "@/components/content/DownloadSourceList";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import { AdSlot } from "@/components/ui/AdSlot";
import { MOCK_MOVIES } from "@/lib/mock-data";

import type { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  let movie = await getMovieBySlug(params.slug);
  if (!movie) {
    movie = MOCK_MOVIES.find((m) => m.slug === params.slug) as any;
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
    movie = MOCK_MOVIES.find((m) => m.slug === params.slug) as any;
  }

  if (!movie) {
    notFound();
  }

  // downloads can be empty for mock items
  const downloads = await getDownloadSourcesForContent(movie.id, "movie").catch(() => []);

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
      <div className="w-full h-[60vh] min-h-[500px] relative">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10 w-2/3" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10 h-full" />
        
        {/* Placeholder gradient */}
        <div className="absolute right-0 top-0 w-3/4 h-full bg-gradient-to-bl from-primary/20 via-transparent to-transparent z-0 opacity-60" />
        
        <div className="absolute bottom-0 left-0 w-full px-6 md:px-10 z-20 max-w-[1920px] mx-auto">
          <div className="max-w-4xl pb-12">
            <div className="flex items-center gap-3 mb-6 text-sm font-medium text-muted">
               <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" strokeWidth={2} /> {movie.releaseDate || 'TBA'}</span>
               <span className="text-muted-foreground/30">•</span>
               <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" strokeWidth={2} /> {movie.runtime || '?'} min</span>
               <span className="text-muted-foreground/30">•</span>
               <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-primary text-primary" strokeWidth={2} /> {movie.rating || 'NR'}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight text-balance">
              {movie.title}
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl">
              {movie.description}
            </p>

            <div className="flex flex-wrap items-center gap-4">
               {/* Streaming Coming Soon visual enforcement */}
               <Button size="lg" className="rounded-pill px-8 gap-2 font-semibold bg-surface-elevated text-muted-foreground hover:bg-surface-elevated cursor-not-allowed border border-white/5 shadow-sm">
                  <Play className="w-4 h-4" strokeWidth={2} /> Streaming Coming Soon
               </Button>
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
              <h3 className="text-lg font-semibold tracking-tight text-foreground mb-6">Metadata</h3>
              <dl className="space-y-5 text-sm">
                <div>
                  <dt className="text-muted mb-1.5">Status</dt>
                  <dd className="text-foreground font-medium capitalize">{movie.status}</dd>
                </div>
                <div>
                  <dt className="text-muted mb-1.5">Original Title</dt>
                  <dd className="text-foreground font-medium">{movie.originalTitle || '-'}</dd>
                </div>
                <div>
                  <dt className="text-muted mb-1.5">Language</dt>
                  <dd className="text-foreground font-medium">{movie.language || 'English'}</dd>
                </div>
              </dl>
           </div>
           
           {/* Sidebar Rectangle Ad */}
           <AdSlot format="rectangle" slotId="movie_sidebar_rect" />
        </div>
      </div>
    </div>
  );
}
