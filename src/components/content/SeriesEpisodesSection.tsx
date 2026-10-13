"use client";

import { useState } from "react";
import { Download, Clock, ChevronDown, FileVideo } from "lucide-react";
import { EpisodeDownloadButton, type EpisodeDownloadSource } from "@/components/content/EpisodeDownloadButton";
import { TorrentGuideModal } from "@/components/content/TorrentGuideModal";
import { Button } from "@/components/ui/button";

export interface SeriesEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  description?: string | null;
  runtime?: number | null;
  releaseDate?: string | null;
  sources?: EpisodeDownloadSource[];
}

export interface SeriesSeason {
  id: string;
  seasonNumber: number;
  title?: string | null;
  episodes?: SeriesEpisode[];
}

interface SeriesEpisodesSectionProps {
  seasons: SeriesSeason[];
  totalEpisodesCount: number;
  totalSeasonsCount?: number;
}

export function SeriesEpisodesSection({
  seasons,
  totalEpisodesCount,
  totalSeasonsCount,
}: SeriesEpisodesSectionProps) {
  // By default, episodes are hidden until the user clicks to expand
  const [expandedSeasons, setExpandedSeasons] = useState<Record<string, boolean>>({});

  const hasMagnetSource = seasons.some((s) =>
    s.episodes?.some((ep) =>
      ep.sources?.some((src) => src.sourceType === "TORRENT_MAGNET" || src.url?.startsWith("magnet:"))
    )
  );

  const isAllExpanded = seasons.length > 0 && seasons.every((s) => expandedSeasons[s.id]);

  const toggleSeason = (seasonId: string) => {
    setExpandedSeasons((prev) => ({
      ...prev,
      [seasonId]: !prev[seasonId],
    }));
  };

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedSeasons({});
    } else {
      const all: Record<string, boolean> = {};
      seasons.forEach((s) => {
        all[s.id] = true;
      });
      setExpandedSeasons(all);
    }
  };

  if (!seasons || seasons.length === 0) {
    return (
      <div className="p-10 sm:p-16 rounded-2xl border border-dashed border-white/10 bg-surface flex flex-col items-center justify-center text-center">
        <FileVideo className="w-10 h-10 text-muted mb-3 opacity-40" />
        <p className="text-lg font-semibold text-foreground mb-1">Episodes Coming Soon</p>
        <p className="text-sm text-muted max-w-md">
          {totalSeasonsCount || totalEpisodesCount
            ? `This series features ${totalSeasonsCount ? `${totalSeasonsCount} season${totalSeasonsCount > 1 ? "s" : ""}` : ""}${totalEpisodesCount ? ` (${totalEpisodesCount} episodes)` : ""}. Episode streaming and download links will appear here shortly.`
            : "This series is currently being indexed and verified. Episode streaming and download links will appear here shortly."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Episodes & Downloads
            </h2>
            {hasMagnetSource && <TorrentGuideModal variant="badge" />}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Select a season to view episodes and download in high definition.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          {seasons.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleAll}
              className="text-xs rounded-full px-3 py-1.5 h-8 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-apple"
            >
              {isAllExpanded ? "Collapse All" : "Expand All"}
            </Button>
          )}

          <span className="whitespace-nowrap text-xs font-semibold px-3 py-1 rounded-full bg-surface border border-white/10 text-muted-foreground">
            {totalEpisodesCount} Total Episodes
          </span>
        </div>
      </div>

      {/* Seasons Accordion List */}
      <div className="space-y-4">
        {seasons.map((season) => {
          const isExpanded = Boolean(expandedSeasons[season.id]);
          const epCount = season.episodes?.length || 0;

          return (
            <div
              key={season.id}
              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                isExpanded
                  ? "border-primary/30 bg-surface/40 shadow-xl"
                  : "border-white/10 bg-surface/20 hover:border-white/20 hover:bg-surface/30"
              }`}
            >
              {/* Season Header Bar - Interactive Accordion Toggle */}
              <button
                type="button"
                onClick={() => toggleSeason(season.id)}
                aria-expanded={isExpanded}
                className="w-full text-left px-4 sm:px-6 py-4 flex items-center justify-between gap-3 cursor-pointer select-none group transition-colors"
              >
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs shrink-0 transition-colors ${
                      isExpanded
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-primary/20 text-primary group-hover:bg-primary/30"
                    }`}
                  >
                    SEASON {season.seasonNumber}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-foreground truncate group-hover:text-primary transition-colors">
                      {season.title || `Season ${season.seasonNumber}`}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                  <span className="text-xs text-muted font-medium whitespace-nowrap hidden sm:inline">
                    {epCount} {epCount === 1 ? "Episode" : "Episodes"}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                      isExpanded
                        ? "bg-primary/15 border-primary/30 text-primary"
                        : "bg-white/5 border-white/10 text-muted-foreground group-hover:bg-white/10 group-hover:text-foreground"
                    }`}
                  >
                    <span>{isExpanded ? "Hide" : "Show"} Episodes</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        isExpanded ? "rotate-180 text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </span>
                </div>
              </button>

              {/* Episodes List Container - Smooth Reveal */}
              {isExpanded && (
                <div className="border-t border-white/10 bg-black/20 divide-y divide-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                  {epCount === 0 ? (
                    <div className="p-8 text-center text-muted text-xs">
                      No episodes listed for this season yet.
                    </div>
                  ) : (
                    season.episodes?.map((ep) => {
                      const sources = ep.sources || [];
                      return (
                        <div
                          key={ep.id}
                          className="p-4 sm:p-5 md:p-6 hover:bg-white/[0.02] transition-colors space-y-3.5"
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold text-xs tracking-wider shrink-0">
                                  EP {ep.episodeNumber}
                                </span>
                                <h4 className="font-semibold text-foreground text-sm sm:text-base md:text-lg">
                                  {ep.title}
                                </h4>
                                {ep.runtime ? (
                                  <span className="text-xs text-muted flex items-center gap-1 font-medium shrink-0">
                                    <Clock className="w-3 h-3" /> {ep.runtime}m
                                  </span>
                                ) : null}
                              </div>
                              {ep.description && (
                                <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-3xl">
                                  {ep.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Episode Download Sources / Links */}
                          <div className="pt-3 border-t border-white/5 space-y-2">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                              <Download className="w-3.5 h-3.5 text-primary" /> Download Episode:
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                              {sources.length === 0 ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-xs text-muted/60 italic">
                                  Direct links coming soon
                                </span>
                              ) : (
                                sources.map((src) => (
                                  <EpisodeDownloadButton key={src.id} source={src} />
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
