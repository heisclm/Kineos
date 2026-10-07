import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Play, Download, Clock, Calendar, Star, Layers, Film, ChevronRight, FileVideo, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DownloadSourceList } from "@/components/content/DownloadSourceList";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import { getSeriesBySlug, getSeriesEpisodes, getCastForContent, getRelatedSeries, getDownloadSourcesForContent } from "@/features/content/content.service";
import { MovieCard } from "@/components/movie/MovieCard";
import { generateSeriesKeywords } from "@/lib/seo";

import type { Metadata, ResolvingMetadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const series = await getSeriesBySlug(params.slug);
  
  if (!series) {
    return { title: 'Series Not Found' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kineos.fun';
  const poster = (series as any).imageUrl || null;
  const backdrop = (series as any).backdropUrl || null;
  const releaseYear = series.releaseDate ? new Date(series.releaseDate).getFullYear() : null;

  const title = releaseYear
    ? `${series.title} (${releaseYear})`
    : series.title;

  const summary = series.shortTeaser || series.description || "";
  const description = summary
    ? `${summary.slice(0, 105).trimEnd()}${summary.length > 105 ? "…" : ""} Cast, episode, and release details on Kineos.`
    : `Explore ${series.title}: synopsis, cast, seasons, episodes, and release information on Kineos.`;

  const cast = await getCastForContent(series.id, "series").catch(() => []);
  const keywords = generateSeriesKeywords({
    title: series.title,
    releaseDate: series.releaseDate,
    genres: (series as any).genres,
    cast: cast.map((c: any) => c.name),
  });

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${siteUrl}/series/${series.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/series/${series.slug}`,
      siteName: "Kineos",
      type: "video.tv_show",
      images: (poster || backdrop) ? [
        {
          url: poster || backdrop,
          width: 1200,
          height: 630,
          alt: series.title,
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

export default async function SeriesDetailPage({ params }: { params: { slug: string } }) {
  const series = await getSeriesBySlug(params.slug);

  if (!series) {
    notFound();
  }

  const [seasonsWithEpisodes, cast, relatedSeries, seriesBatchDownloads] = await Promise.all([
    getSeriesEpisodes(series.id).catch(() => [] as any[]),
    getCastForContent(series.id, "series").catch(() => []),
    getRelatedSeries(series.id, 5).catch(() => []),
    getDownloadSourcesForContent(series.id, "series").catch(() => []),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kineos.fun';
  const backdrop = (series as any).backdropUrl || (series as any).imageUrl || null;
  const poster = (series as any).imageUrl || null;

  const totalEpisodesCount = seasonsWithEpisodes.reduce((acc, s) => acc + (s.episodes?.length || 0), 0);
  const releaseYear = series.releaseDate ? new Date(series.releaseDate).getFullYear() : null;

  const pageKeywords = generateSeriesKeywords({
    title: series.title,
    releaseDate: series.releaseDate,
    genres: (series as any).genres,
    cast: cast.map((c: any) => c.name),
    seasonCount: seasonsWithEpisodes.length,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TVSeries",
        "@id": `${siteUrl}/series/${series.slug}#tvseries`,
        name: series.title,
        description: series.description,
        datePublished: series.releaseDate || undefined,
        image: poster || backdrop || undefined,
        url: `${siteUrl}/series/${series.slug}`,
        numberOfSeasons: seasonsWithEpisodes.length,
        numberOfEpisodes: totalEpisodesCount,
        genre: series.genres || [],
        keywords: pageKeywords.join(", "),
        actor: cast.map((c: any) => ({
          "@type": "Person",
          name: c.name,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/series/${series.slug}#breadcrumb`,
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
            name: "TV Series",
            item: `${siteUrl}/series`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: series.title,
            item: `${siteUrl}/series/${series.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full relative pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker id={series.id} type="series" />

      {/* Series Hero/Backdrop Layer */}
      <div className="w-full relative bg-background">
        <div className="w-full min-h-[430px] sm:min-h-[460px] md:min-h-[460px] lg:min-h-[500px] xl:min-h-[560px] 2xl:min-h-[600px] relative flex flex-col justify-end">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
          <div className="md:hidden absolute inset-0 bg-gradient-to-r from-transparent via-background/45 to-background/85 z-10" />
          <div className="hidden md:block absolute inset-y-0 left-0 w-[82%] bg-gradient-to-r from-background via-background/85 to-transparent z-10" />

          {backdrop ? (
            <Image
              src={backdrop}
              alt={series.title}
              fill
              className="object-cover object-top z-0 opacity-40 md:opacity-50"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 via-transparent to-transparent z-0 opacity-60" />
          )}

          <div className="relative z-20 w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 pb-8 md:pb-0 md:translate-y-8">
            <div className="relative flex gap-4 sm:gap-6 md:gap-8 lg:gap-10 items-end">
            <div className="relative z-30 w-[40%] max-w-[160px] md:w-52 md:max-w-none lg:w-56 xl:w-72 2xl:w-80 aspect-[2/3] shrink-0 rounded-xl md:rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.55)] border border-white/10 bg-surface flex items-center justify-center">
              {poster ? (
                <Image src={poster} alt={series.title} fill className="object-cover" priority />
              ) : (
                <Film className="w-10 h-10 md:w-12 md:h-12 opacity-30" />
              )}
            </div>

            <div className="min-w-0 flex-1 min-h-[220px] md:min-h-[312px] lg:min-h-[336px] xl:min-h-[432px] flex flex-col pt-14 sm:pt-16 md:pt-16 lg:pt-20 xl:pt-24">
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <Badge variant="glass" className="px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-semibold tracking-wider bg-primary/20 text-primary border-primary/20">
                  TV SERIES
                </Badge>
                {series.genres?.filter((g: string | null): g is string => Boolean(g)).map((g: string, index: number) => (
                  <Badge key={g} variant="glass" className={`${index >= 2 ? "hidden md:inline-flex" : ""} px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-medium bg-white/10 border-white/20 text-white/90`}>
                    {g}
                  </Badge>
                ))}
              </div>

              <h1 className="text-xl sm:text-2xl md:text-4xl xl:text-6xl 2xl:text-7xl font-bold text-foreground mb-3 md:mb-4 leading-[1.05] tracking-tight text-balance break-words max-w-5xl drop-shadow-2xl">
                {series.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-2 md:gap-x-3 gap-y-1 mb-3 md:mb-5 text-xs md:text-sm font-semibold text-white/90 drop-shadow-md">
                {releaseYear && (
                  <span className="flex items-center gap-1 md:gap-1.5">
                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" strokeWidth={2.5} /> {releaseYear}
                  </span>
                )}
                <span className="text-white/40">&bull;</span>
                <span className="flex items-center gap-1 md:gap-1.5">
                  <Layers className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" strokeWidth={2.5} /> {seasonsWithEpisodes.length} {seasonsWithEpisodes.length === 1 ? 'Season' : 'Seasons'}
                </span>
                <span className="text-white/40">&bull;</span>
                <span className="flex items-center gap-1 md:gap-1.5">
                  <FileVideo className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" strokeWidth={2.5} /> {totalEpisodesCount} Episodes
                </span>
                <span className="text-white/40">&bull;</span>
                <span className="flex items-center gap-1 md:gap-1.5">
                  <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-primary text-primary" strokeWidth={2.5} /> {(series as any).rating || 'NR'}
                </span>
              </div>

              <p className="hidden md:block text-xs sm:text-sm md:text-base xl:text-lg text-white/90 leading-relaxed mb-4 md:mb-5 max-w-3xl line-clamp-2 drop-shadow-lg font-medium">
                {(series as any).shortTeaser || series.description}
              </p>

              {seriesBatchDownloads && seriesBatchDownloads.length > 0 && (
                <div className="hidden md:block mb-3 md:mb-4">
                  <a href="#batch-downloads">
                    <Button size="sm" variant="secondary" className="rounded-full px-3 sm:px-4 gap-2 text-[10px] sm:text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-apple shadow-lg">
                      <Download className="w-4 h-4 text-primary" /> Full Series Download ({seriesBatchDownloads.length})
                    </Button>
                  </a>
                </div>
              )}

              <div className="hidden md:block mt-auto pt-2">
                <a href="#episodes">
                  <Button size="lg" className="rounded-full px-3 sm:px-8 gap-2 text-xs sm:text-base font-semibold bg-primary text-primary-foreground hover:scale-[1.03] transition-apple shadow-lg border border-primary/20">
                    <Play className="w-4 h-4 shrink-0" fill="currentColor" />
                    <span className="sm:hidden">Browse Episodes</span>
                    <span className="hidden sm:inline">Browse Episodes & Downloads</span>
                  </Button>
                </a>
              </div>
              <div className="md:hidden mt-auto pt-2">
                <a href="#episodes">
                  <Button size="lg" className="rounded-full px-3 sm:px-5 gap-2 text-xs sm:text-sm font-semibold bg-primary text-primary-foreground shadow-lg border border-primary/20">
                    <Play className="w-4 h-4 shrink-0" fill="currentColor" /> Browse Episodes
                  </Button>
                </a>
              </div>
            </div>
            </div>
            <p className="md:hidden mt-4 max-w-2xl text-sm text-white/85 leading-relaxed line-clamp-2 drop-shadow-lg font-medium">
              {(series as any).shortTeaser || series.description}
            </p>
            {seriesBatchDownloads && seriesBatchDownloads.length > 0 && (
              <div className="md:hidden mt-3">
                <a href="#batch-downloads">
                  <Button size="sm" variant="secondary" className="rounded-full px-3 gap-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15">
                    <Download className="w-4 h-4 text-primary" /> Full Series Download ({seriesBatchDownloads.length})
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for desktop poster overlap */}
      <div className="hidden md:block h-12 md:h-16 w-full bg-background" />

      {/* Main Grid Content */}
      <div className="mt-4 px-6 md:px-10 max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 xl:col-span-9 space-y-12">
          {/* Storyline */}
          {series.description && (
            <section>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mb-4">Storyline</h3>
              <div className="p-6 md:p-10 rounded-2xl md:rounded-3xl bg-surface/40 backdrop-blur-sm border border-white/5 shadow-inner text-white/80 text-base md:text-lg leading-relaxed md:leading-[1.8] font-medium text-left text-pretty">
                {series.description}
              </div>
            </section>
          )}

          {/* Top Cast Section */}
          {cast.length > 0 && (
            <section>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mb-6">Top Cast</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {cast.map((c: any) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-3 p-2 pr-4 rounded-full bg-surface border border-white/5 shadow-sm hover:bg-surface-elevated transition-apple cursor-default overflow-hidden"
                  >
                    {c.imageUrl ? (
                      <Image
                        src={c.imageUrl}
                        alt={c.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground font-semibold border border-white/10 shrink-0 text-xs">
                        {c.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[13px] font-semibold text-foreground truncate">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium truncate">
                        {c.role || 'Actor'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Complete Series / Season Batch Downloads (If Available) */}
          {seriesBatchDownloads && seriesBatchDownloads.length > 0 && (
            <section id="batch-downloads" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" /> Full Series & Season Downloads
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Download full season packages and complete series batches in high quality.
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/20">
                  {seriesBatchDownloads.length} {seriesBatchDownloads.length === 1 ? 'Source' : 'Sources'}
                </span>
              </div>
              <DownloadSourceList sources={seriesBatchDownloads as any} />
            </section>
          )}

          {/* Episodes & Individual Episode Downloads Section */}
          <section id="episodes" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Episodes & Downloads</h2>
                <p className="text-sm text-muted-foreground mt-1">Select an episode to view synopsis and download in high definition.</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface border border-white/10 text-muted-foreground">
                {totalEpisodesCount} Total Episodes
              </span>
            </div>

            {seasonsWithEpisodes.length === 0 ? (
              <div className="p-16 rounded-2xl border border-dashed border-white/10 bg-surface flex flex-col items-center justify-center text-center">
                <FileVideo className="w-10 h-10 text-muted mb-3 opacity-40" />
                <p className="text-lg font-semibold text-foreground mb-1">Episodes Coming Soon</p>
                <p className="text-sm text-muted max-w-md">This series is currently being indexed and verified. Episode streaming and download links will appear here shortly.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {seasonsWithEpisodes.map((season: any) => (
                  <div key={season.id} className="border border-white/10 rounded-2xl overflow-hidden bg-surface/30 backdrop-blur-md shadow-lg">
                    {/* Season Header */}
                    <div className="px-6 py-4 bg-surface-elevated/60 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-md bg-primary/20 text-primary font-bold text-xs">
                          SEASON {season.seasonNumber}
                        </span>
                        <h3 className="font-bold text-lg text-foreground">
                          {season.title || `Season ${season.seasonNumber}`}
                        </h3>
                      </div>
                      <span className="text-xs text-muted font-medium">
                        {season.episodes?.length || 0} Episodes
                      </span>
                    </div>

                    {/* Episodes List with Downloads */}
                    <div className="divide-y divide-white/5">
                      {season.episodes?.map((ep: any) => {
                        const sources = ep.sources || [];
                        return (
                          <div
                            key={ep.id}
                            className="p-5 md:p-6 hover:bg-white/[0.02] transition-colors space-y-4"
                          >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold text-xs tracking-wider">
                                    EP {ep.episodeNumber}
                                  </span>
                                  <h4 className="font-semibold text-foreground text-base md:text-lg">
                                    {ep.title}
                                  </h4>
                                  {ep.runtime && (
                                    <span className="text-xs text-muted flex items-center gap-1 font-medium">
                                      <Clock className="w-3 h-3" /> {ep.runtime}m
                                    </span>
                                  )}
                                </div>
                                {ep.description && (
                                  <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
                                    {ep.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Episode Download Sources / Links */}
                            <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-3">
                              <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                                <Download className="w-3.5 h-3.5 text-primary" /> Download Episode:
                              </span>

                              {sources.length === 0 ? (
                                <span className="text-xs text-muted/60 italic">
                                  Direct links coming soon
                                </span>
                              ) : (
                                sources.map((src: any) => (
                                  <a
                                    key={src.id}
                                    href={`/api/downloads/${src.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 text-xs font-semibold text-primary transition-apple hover:scale-105"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>{src.quality || 'HD'}</span>
                                    {src.format && <span className="text-white/60 text-[10px] uppercase">({src.format})</span>}
                                    {src.fileSize && (
                                      <span className="text-white/60 text-[10px]">
                                        &bull; {(src.fileSize / (1024 * 1024)).toFixed(0)} MB
                                      </span>
                                    )}
                                  </a>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar: Comprehensive Series Info */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-8">
          <div className="p-8 rounded-2xl bg-surface border border-white/5 shadow-xl space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-foreground pb-3 border-b border-white/5">
              Series Info
            </h3>
            
            <dl className="space-y-5 text-sm">
              <div>
                <dt className="text-muted text-xs uppercase tracking-wider mb-1 font-semibold">Status</dt>
                <dd className="text-foreground font-medium capitalize">
                  {series.status || 'Released'}
                </dd>
              </div>

              {releaseYear && (
                <div>
                  <dt className="text-muted text-xs uppercase tracking-wider mb-1 font-semibold">First Air Date</dt>
                  <dd className="text-foreground font-medium">
                    {new Date(series.releaseDate!).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-muted text-xs uppercase tracking-wider mb-1 font-semibold">Content Rating</dt>
                <dd className="text-foreground font-medium">
                  {(series as any).rating || 'Not Rated (NR)'}
                </dd>
              </div>

              <div>
                <dt className="text-muted text-xs uppercase tracking-wider mb-1 font-semibold">Original Language</dt>
                <dd className="text-foreground font-medium">
                  {(series as any).language || 'English'}
                </dd>
              </div>

              <div>
                <dt className="text-muted text-xs uppercase tracking-wider mb-1 font-semibold">Seasons & Episodes</dt>
                <dd className="text-foreground font-medium">
                  {seasonsWithEpisodes.length} {seasonsWithEpisodes.length === 1 ? 'Season' : 'Seasons'} &bull; {totalEpisodesCount} Episodes
                </dd>
              </div>

              <div>
                <dt className="text-muted text-xs uppercase tracking-wider mb-1 font-semibold">Catalog Views</dt>
                <dd className="text-foreground font-medium">
                  {series.viewCount.toLocaleString()}
                </dd>
              </div>

              {series.genres && series.genres.length > 0 && (
                <div>
                  <dt className="text-muted text-xs uppercase tracking-wider mb-2 font-semibold">Genres</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {series.genres.map((g: string) => (
                      <Link
                        key={g}
                        href={`/series?genre=${encodeURIComponent(g.toLowerCase())}`}
                        className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-foreground transition-colors"
                      >
                        {g}
                      </Link>
                    ))}
                  </dd>
                </div>
              )}
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
