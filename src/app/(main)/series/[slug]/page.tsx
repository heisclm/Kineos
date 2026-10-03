import Image from "next/image";
import { notFound } from "next/navigation";
import { Play, Download, Clock, Calendar, Star, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DownloadSourceList } from "@/components/content/DownloadSourceList";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import { getSeriesBySlug, getSeriesEpisodes, getCastForContent, getRelatedSeries } from "@/features/content/content.service";
import { MovieCard } from "@/components/movie/MovieCard";

import type { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const series = await getSeriesBySlug(params.slug);
  
  if (!series) {
    return { title: 'Series Not Found | Kineos' };
  }

  return {
    title: `${series.title} | Kineos`,
    description: series.description,
    openGraph: {
      title: series.title,
      description: series.description || undefined,
      type: "video.tv_show",
    },
  };
}

export default async function SeriesDetailPage({ params }: { params: { slug: string } }) {
  const series = await getSeriesBySlug(params.slug);

  if (!series) {
    notFound();
  }

  const seasonsWithEpisodes = await getSeriesEpisodes(series.id) as any[];
  const cast = await getCastForContent(series.id, "series").catch(() => []);
  const relatedSeries = await getRelatedSeries(series.id, 5).catch(() => []);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kineos.com';
  const backdrop = (series as any).backdropUrl || (series as any).imageUrl || null;
  const poster = (series as any).imageUrl || null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: series.title,
    description: series.description,
    dateCreated: series.releaseDate,
    image: poster || backdrop || undefined,
    url: `${siteUrl}/series/${series.slug}`,
    numberOfSeasons: seasonsWithEpisodes.length,
    actor: cast.filter(c => c.role === 'actor').map(c => ({
      "@type": "Person",
      name: c.name
    }))
  };

  return (
    <div className="w-full relative pb-24">
      <ViewTracker id={series.id} type="series" />
      
                  {/* Series Hero/Backdrop Layer */}
      <div className="w-full relative bg-background">
        <div className="w-full h-[65vh] md:h-[70vh] min-h-[550px] md:min-h-[600px] relative flex flex-col justify-end">
           <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
           <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10 w-2/3" />
           
           {(series as any).backdropUrl || (series as any).imageUrl ? (
             <Image 
               src={(series as any).backdropUrl || (series as any).imageUrl}
               alt={series.title}
               fill
               className="object-cover object-top z-0 opacity-40 md:opacity-50 mix-blend-screen"
               priority
             />
           ) : (
             <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 via-transparent to-transparent z-0 opacity-60" />
           )}
           
           <div className="relative z-20 w-full max-w-[1920px] mx-auto px-4 md:px-10 pb-8 md:pb-12 flex gap-6 md:gap-10 items-end">
             
             {(series as any).imageUrl && (
               <div className="hidden md:block w-40 md:w-64 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative z-30 transform translate-y-12 md:translate-y-24">
                 <Image src={(series as any).imageUrl} alt={series.title} fill className="object-cover" />
               </div>
             )}
             
             <div className="flex-1 text-left mt-2 md:mt-0 w-full">
                {/* Mobile Poster (Shown next to title on mobile for premium look) */}
                <div className="md:hidden flex gap-4 items-end mb-4">
                  {(series as any).imageUrl && (
                    <div className="w-28 aspect-[2/3] shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/10 relative z-30">
                      <Image src={(series as any).imageUrl} alt={series.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="pb-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="glass" className="px-2 py-0.5 text-[10px] font-semibold tracking-wider bg-primary/20 text-primary border-primary/20">
                        SERIES
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground leading-[1.1] tracking-tight text-balance drop-shadow-2xl mb-2">
                      {series.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/90 drop-shadow-md">
                      {series.releaseDate && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" strokeWidth={2.5} /> {new Date(series.releaseDate).getFullYear()}</span>}
                      <span className="text-white/40">&bull;</span>
                      <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" strokeWidth={2.5} /> {seasonsWithEpisodes.length} S</span>
                      <span className="text-white/40">&bull;</span>
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-primary text-primary" strokeWidth={2.5} /> {(series as any).rating || 'NR'}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="glass" className="px-3 py-1 text-xs font-semibold tracking-wider bg-primary/20 text-primary border-primary/20">
                    SERIES
                  </Badge>
                  {series.genres?.map((g: string | null) => (
                    <Badge key={g} variant="glass" className="px-3 py-1 text-xs font-medium bg-white/10 border-white/20 text-white/90">
                      {g}
                    </Badge>
                  ))}
                </div>

                <h1 className="hidden md:block text-5xl lg:text-7xl font-bold text-foreground mb-4 leading-[1.1] tracking-tight text-balance drop-shadow-2xl">
                  {series.title}
                </h1>
                
                <div className="hidden md:flex flex-wrap items-center gap-3 mb-6 text-sm font-semibold text-white/90 drop-shadow-md">
                  {series.releaseDate && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" strokeWidth={2.5} /> {new Date(series.releaseDate).getFullYear()}</span>}
                  <span className="text-white/40">&bull;</span>
                  <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" strokeWidth={2.5} /> {seasonsWithEpisodes.length} Seasons</span>
                  <span className="text-white/40">&bull;</span>
                  <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-primary text-primary" strokeWidth={2.5} /> {(series as any).rating || 'NR'}</span>
                  
                </div>
                
                <p className="text-sm md:text-lg text-white/90 leading-relaxed mb-6 md:mb-8 max-w-3xl drop-shadow-lg font-medium">
                  {(series as any).shortTeaser || series.description}
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

      

      <div className="mt-4 px-6 md:px-10 max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 xl:col-span-9 space-y-12">
          
          {series.description && (
            <section className="mb-12">
              <h3 className="text-2xl font-bold tracking-tight text-foreground mb-4">Storyline</h3>
              <div className="p-6 rounded-2xl bg-surface border border-white/5 shadow-sm text-muted-foreground leading-relaxed">
                {series.description}
              </div>
            </section>
          )}

           <section id="episodes">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-8">Episodes</h2>
              
              {seasonsWithEpisodes.length === 0 ? (
                <div className="p-16 rounded-xl border border-dashed border-white/5 bg-surface flex flex-col items-center justify-center text-center">
                  <p className="text-lg font-medium text-foreground mb-2">No episodes available</p>
                  <p className="text-sm text-muted">This series is currently being prepared for our catalog.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {seasonsWithEpisodes.map((season) => (
                    <div key={season.id} className="border border-white/5 rounded-2xl overflow-hidden bg-black/20">
                      <div className="px-6 py-4 bg-surface-elevated/40 backdrop-blur border-b border-white/5">
                        <h3 className="font-bold text-lg text-foreground">Season {season.seasonNumber}</h3>
                      </div>
                      <div className="divide-y divide-white/5">
                        {season.episodes?.map((ep: any) => (
                          <div key={ep.id} className="p-4 md:p-6 flex flex-col md:flex-row gap-6 md:items-center hover:bg-white/[0.02] transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-primary font-bold">E{ep.episodeNumber}</span>
                                <h4 className="font-semibold text-foreground text-lg">{ep.title}</h4>
                              </div>
                              <p className="text-sm text-muted line-clamp-2">{ep.description || "No description available."}</p>
                            </div>
                            <Button size="sm" className="rounded-full shrink-0">
                              <Play className="w-4 h-4 mr-2" /> Watch
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
           </section>

           <div className="pt-4">
             
           </div>
        </div>
        
        <div className="lg:col-span-4 xl:col-span-3 space-y-8">
           <div className="p-8 rounded-xl bg-surface border border-white/5">
              <h3 className="text-lg font-semibold tracking-tight text-foreground mb-6">Series Info</h3>
              <dl className="space-y-5 text-sm">
                <div>
                  <dt className="text-muted mb-1.5">Views</dt>
                  <dd className="text-foreground font-medium">{series.viewCount.toLocaleString()}</dd>
                </div>
              </dl>
           </div>
           
           
        </div>
      </div>

      {/* Related Series */}
      {relatedSeries && relatedSeries.length > 0 && (
        <div className="w-full px-6 md:px-10 max-w-[1920px] mx-auto mt-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">More Like This</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {relatedSeries.map((s: any) => (
              <MovieCard
                key={s.id}
                id={s.id}
                title={s.title}
                slug={s.slug}
                description={s.description || ""}
                imageUrl={(s as any).imageUrl || ""}
                primaryGenre={s.genre || "TV Series"}
                type="series"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}







