"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Tv, Loader2, Trash2, ChevronDown, ChevronUp, Download, Link as LinkIcon, Magnet, Clock } from "lucide-react";
import { createSeason, deleteSeason, createEpisode, deleteEpisode } from "@/features/admin/admin.actions";
import { deleteDownloadSource } from "@/features/admin/sources.actions";
import { AddSourceModal } from "./AddSourceModal";
import { toast } from "sonner";

interface EpisodeManagerProps {
  seriesId: string;
  existingSeasons: any[];
}

export function EpisodeManager({ seriesId, existingSeasons }: EpisodeManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [seasonNumber, setSeasonNumber] = useState("");
  const [seasonTitle, setSeasonTitle] = useState("");
  const [expandedSeasons, setExpandedSeasons] = useState<Record<string, boolean>>(() => {
    // Expand the first season by default if available
    const initial: Record<string, boolean> = {};
    if (existingSeasons && existingSeasons.length > 0) {
      initial[existingSeasons[0].id] = true;
    }
    return initial;
  });

  // State for AddSourceModal on a specific episode
  const [activeEpisodeForSource, setActiveEpisodeForSource] = useState<{ id: string; title: string } | null>(null);

  // State for adding episode per season
  const [newEpData, setNewEpData] = useState<Record<string, { number: string; title: string; runtime: string; description: string }>>({});

  const toggleSeason = (seasonId: string) => {
    setExpandedSeasons((prev) => ({
      ...prev,
      [seasonId]: !prev[seasonId],
    }));
  };

  const handleAddSeason = () => {
    if (!seasonNumber) return;
    const num = parseInt(seasonNumber, 10);
    if (isNaN(num)) return toast.error("Please enter a valid season number");

    startTransition(async () => {
      const res = await createSeason(seriesId, num, seasonTitle || undefined);
      if (res.success) {
        toast.success(`Season ${num} created!`);
        setSeasonNumber("");
        setSeasonTitle("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create season");
      }
    });
  };

  const handleDeleteSeason = (seasonId: string, sNum: number) => {
    if (!confirm(`Are you sure you want to delete Season ${sNum}? All of its episodes and download links will be permanently deleted.`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteSeason(seasonId, seriesId);
      if (res.success) {
        toast.success(`Season ${sNum} deleted`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete season");
      }
    });
  };

  const handleAddEpisode = (seasonId: string) => {
    const data = newEpData[seasonId] || { number: "", title: "", runtime: "", description: "" };
    if (!data.number || !data.title) {
      return toast.error("Episode number and title are required");
    }
    const num = parseInt(data.number, 10);
    const rt = data.runtime ? parseInt(data.runtime, 10) : undefined;

    startTransition(async () => {
      const res = await createEpisode(seasonId, num, data.title, seriesId, data.description, rt);
      if (res.success) {
        toast.success(`Episode ${num} added!`);
        setNewEpData((prev) => ({
          ...prev,
          [seasonId]: { number: "", title: "", runtime: "", description: "" },
        }));
        router.refresh();
      } else {
        toast.error(res.error || "Failed to add episode");
      }
    });
  };

  const handleDeleteEpisode = (episodeId: string, epNum: number) => {
    if (!confirm(`Are you sure you want to delete Episode ${epNum}? All its download links will also be removed.`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteEpisode(episodeId, seriesId);
      if (res.success) {
        toast.success(`Episode ${epNum} deleted`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete episode");
      }
    });
  };

  const handleDeleteSource = (sourceId: string, episodeId: string) => {
    if (!confirm("Are you sure you want to remove this download source?")) return;
    startTransition(async () => {
      const res = await deleteDownloadSource(sourceId, episodeId, "episode", seriesId);
      if (res.success) {
        toast.success("Download link deleted");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete download link");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tv className="w-5 h-5 text-primary" /> Seasons & Episode Download Links
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize episodes by season and attach individual 480p, 720p, 1080p, and 4K download sources to each episode.
          </p>
        </div>
      </div>

      {/* Add New Season Form */}
      <div className="p-5 rounded-2xl bg-surface-elevated/40 border border-white/10 backdrop-blur-md flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <input
          type="number"
          min="1"
          value={seasonNumber}
          onChange={(e) => setSeasonNumber(e.target.value)}
          placeholder="Season #"
          className="w-full sm:w-28 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground"
        />
        <input
          type="text"
          value={seasonTitle}
          onChange={(e) => setSeasonTitle(e.target.value)}
          placeholder="Season Title (e.g. Season 1)"
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground"
        />
        <Button
          onClick={handleAddSeason}
          disabled={isPending || !seasonNumber}
          className="rounded-full px-6 font-semibold bg-primary text-primary-foreground hover:scale-105 transition-apple shadow-md"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          Add Season
        </Button>
      </div>

      {/* List of Seasons */}
      <div className="space-y-6">
        {(!existingSeasons || existingSeasons.length === 0) ? (
          <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center flex flex-col items-center justify-center">
            <Tv className="w-8 h-8 text-muted mb-2 opacity-50" />
            <p className="text-muted-foreground font-medium text-sm">No seasons added yet</p>
            <p className="text-xs text-muted mt-1">Start by adding Season 1 above to begin uploading episodes and download sources.</p>
          </div>
        ) : (
          existingSeasons.map((season) => {
            const isExpanded = !!expandedSeasons[season.id];
            const epCount = season.episodes?.length || 0;
            const seasonForm = newEpData[season.id] || { number: (epCount + 1).toString(), title: "", runtime: "", description: "" };

            return (
              <div key={season.id} className="border border-white/10 rounded-2xl overflow-hidden bg-surface/40 backdrop-blur-md shadow-xl transition-all">
                {/* Season Header Bar */}
                <div
                  className="px-6 py-4 bg-surface-elevated/60 border-b border-white/5 flex items-center justify-between cursor-pointer select-none hover:bg-surface-elevated transition-colors"
                  onClick={() => toggleSeason(season.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold text-sm flex items-center justify-center">
                      S{season.seasonNumber}
                    </span>
                    <div>
                      <h4 className="font-bold text-foreground text-base tracking-tight">
                        {season.title || `Season ${season.seasonNumber}`}
                      </h4>
                      <p className="text-xs text-muted">
                        {epCount} {epCount === 1 ? "Episode" : "Episodes"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-full w-8 h-8 text-muted hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSeason(season.id, season.seasonNumber);
                      }}
                      title="Delete Season"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="p-1 text-muted">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Season Content & Episodes */}
                {isExpanded && (
                  <div className="p-6 space-y-6">
                    {/* Episodes List */}
                    <div className="space-y-4">
                      {epCount === 0 ? (
                        <p className="text-xs text-muted italic p-4 text-center border border-dashed border-white/5 rounded-xl">
                          No episodes in this season yet. Add the first episode below.
                        </p>
                      ) : (
                        season.episodes.map((ep: any) => {
                          const sources = ep.sources || [];
                          return (
                            <div key={ep.id} className="p-4 md:p-5 rounded-xl bg-black/30 border border-white/5 hover:border-white/10 transition-apple space-y-3">
                              {/* Episode Top Info */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                  <span className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary font-bold text-xs tracking-wider">
                                    EP {ep.episodeNumber}
                                  </span>
                                  <span className="font-semibold text-foreground text-sm md:text-base">
                                    {ep.title}
                                  </span>
                                  {ep.runtime && (
                                    <span className="text-xs text-muted flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {ep.runtime}m
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setActiveEpisodeForSource({ id: ep.id, title: `S${season.seasonNumber}:E${ep.episodeNumber} - ${ep.title}` })}
                                    className="rounded-full h-8 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Add Download Link
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteEpisode(ep.id, ep.episodeNumber)}
                                    className="rounded-full w-8 h-8 text-muted hover:text-destructive hover:bg-destructive/10"
                                    title="Delete Episode"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Episode Description if any */}
                              {ep.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 pl-1">
                                  {ep.description}
                                </p>
                              )}

                              {/* Attached Download Links for this Episode */}
                              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted mr-1">
                                  Links ({sources.length}):
                                </span>
                                {sources.length === 0 ? (
                                  <span className="text-xs text-muted/60 italic">No download links attached</span>
                                ) : (
                                  sources.map((src: any) => (
                                    <div
                                      key={src.id}
                                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-white/10 text-xs font-medium text-foreground shadow-sm"
                                    >
                                      {src.sourceType === 'CLOUDFLARE_R2' && <Download className="w-3 h-3 text-download-r2" />}
                                      {src.sourceType === 'DIRECT_URL' && <LinkIcon className="w-3 h-3 text-download-direct" />}
                                      {src.sourceType === 'TORRENT_MAGNET' && <Magnet className="w-3 h-3 text-download-magnet" />}
                                      <span className="font-bold text-primary">{src.quality || 'HD'}</span>
                                      {src.format && <span className="text-muted text-[10px]">{src.format}</span>}
                                      {src.fileSize && (
                                        <span className="text-muted text-[10px]">
                                          {(src.fileSize / (1024 * 1024)).toFixed(0)}MB
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteSource(src.id, ep.id)}
                                        className="text-muted hover:text-destructive ml-1"
                                        title="Remove source"
                                      >
                                        &times;
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Add Episode Form for this Season */}
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-primary">
                        + Add Episode to Season {season.seasonNumber}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            min="1"
                            value={seasonForm.number}
                            onChange={(e) =>
                              setNewEpData((prev) => ({
                                ...prev,
                                [season.id]: { ...seasonForm, number: e.target.value },
                              }))
                            }
                            placeholder="Ep #"
                            className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="sm:col-span-7">
                          <input
                            type="text"
                            value={seasonForm.title}
                            onChange={(e) =>
                              setNewEpData((prev) => ({
                                ...prev,
                                [season.id]: { ...seasonForm, title: e.target.value },
                              }))
                            }
                            placeholder="Episode Title (e.g. Pilot)"
                            className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="number"
                            min="1"
                            value={seasonForm.runtime}
                            onChange={(e) =>
                              setNewEpData((prev) => ({
                                ...prev,
                                [season.id]: { ...seasonForm, runtime: e.target.value },
                              }))
                            }
                            placeholder="Runtime (mins)"
                            className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="sm:col-span-12">
                          <textarea
                            rows={2}
                            value={seasonForm.description}
                            onChange={(e) =>
                              setNewEpData((prev) => ({
                                ...prev,
                                [season.id]: { ...seasonForm, description: e.target.value },
                              }))
                            }
                            placeholder="Episode synopsis / overview (optional)..."
                            className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          onClick={() => handleAddEpisode(season.id)}
                          disabled={isPending || !seasonForm.number || !seasonForm.title}
                          size="sm"
                          className="rounded-full px-5 font-semibold bg-white/10 hover:bg-white/20 text-foreground"
                        >
                          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                          Add Episode
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Source Modal for Specific Episode */}
      {activeEpisodeForSource && (
        <AddSourceModal
          isOpen={true}
          onClose={() => setActiveEpisodeForSource(null)}
          contentId={activeEpisodeForSource.id}
          contentType="episode"
          seriesId={seriesId}
        />
      )}
    </div>
  );
}
