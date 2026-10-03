import { notFound } from "next/navigation";
import { Play, Download, Clock, Calendar, Star, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DownloadSourceList } from "@/components/content/DownloadSourceList";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import { AdSlot } from "@/components/ui/AdSlot";
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

  return (
    <div className="w-full relative pb-24">
      <ViewTracker id={series.id} type="series" />
      
      <div className="relative w-full h-[60vh] md:h-[75vh] max-h-[800px] bg-surface-elevated">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10 w-3/4" />
        
        <div className="relative z-20 w-full h-full max-w-[1920px] mx-auto px-6 md:px-10 flex flex-col justify-end pb-16 md:pb-24">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="glass" className="px-3 py-1 text-xs font-semibold tracking-wider bg-primary/20 text-primary border-primary/20">
                SERIES
              </Badge>
              {series.genres?.map((g: string | null) => (
                <Badge key={g} variant="glass" className="px-3 py-1 text-xs font-medium bg-white/5 border-white/10 text-white/80">
                  {g}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground mb-6 leading-tight">
              {series.title}
            </h1>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium mb-8">
              {series.releaseDate && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(series.releaseDate).getFullYear()}</span>}
              <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" /> {seasonsWithEpisodes.length} Seasons</span>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl">
              {(series as any).shortTeaser || series.description}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center py-8 px-6 md:px-10 max-w-[1920px] mx-auto relative z-20">
        <AdSlot format="leaderboard" slotId="series_top_leaderboard" />
      </div>

      <div className="mt-4 px-6 md:px-10 max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 xl:col-span-9 space-y-12">
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
             <AdSlot format="banner" slotId="series_episodes_bottom" />
           </div>
        </div>
        
        <div className="lg:col-span-4 xl:col-span-3 space-y-8">
           <div className="p-8 rounded-xl bg-surface border border-white/5">
              <h3 className="text-lg font-semibold tracking-tight text-foreground mb-6">Metadata</h3>
              <dl className="space-y-5 text-sm">
                <div>
                  <dt className="text-muted mb-1.5">Views</dt>
                  <dd className="text-foreground font-medium">{series.viewCount.toLocaleString()}</dd>
                </div>
              </dl>
           </div>
           
           <AdSlot format="rectangle" slotId="series_sidebar_rect" />
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




