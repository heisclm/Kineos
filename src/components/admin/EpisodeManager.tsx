"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Tv, Loader2 } from "lucide-react";
import { createSeason, createEpisode } from "@/features/admin/admin.actions";

export function EpisodeManager({ seriesId, existingSeasons }: { seriesId: string, existingSeasons: any[] }) {
  const [loading, setLoading] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState("");
  const [activeSeason, setActiveSeason] = useState<string | null>(null);

  const [epNumber, setEpNumber] = useState("");
  const [epTitle, setEpTitle] = useState("");

  const handleAddSeason = async () => {
    if (!seasonNumber) return;
    setLoading(true);
    await createSeason(seriesId, parseInt(seasonNumber));
    setSeasonNumber("");
    setLoading(false);
  };

  const handleAddEpisode = async (seasonId: string) => {
    if (!epNumber || !epTitle) return;
    setLoading(true);
    await createEpisode(seasonId, parseInt(epNumber), epTitle, seriesId);
    setEpNumber("");
    setEpTitle("");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Tv className="w-5 h-5 text-primary" /> Seasons & Episodes
        </h3>
      </div>

      {/* Add Season */}
      <div className="flex gap-4 items-center bg-black/20 p-4 rounded-xl border border-white/5">
        <input
          type="number"
          value={seasonNumber}
          onChange={e => setSeasonNumber(e.target.value)}
          placeholder="Season Number (e.g. 1)"
          className="bg-surface border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
        />
        <Button onClick={handleAddSeason} disabled={loading || !seasonNumber} size="sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          Add Season
        </Button>
      </div>

      {/* List Seasons */}
      <div className="space-y-4">
        {existingSeasons.map((season) => (
          <div key={season.id} className="border border-white/10 rounded-xl overflow-hidden">
            <div 
              className="bg-surface-hover px-6 py-4 flex items-center justify-between cursor-pointer"
              onClick={() => setActiveSeason(activeSeason === season.id ? null : season.id)}
            >
              <h4 className="font-semibold text-foreground">Season {season.seasonNumber}</h4>
              <span className="text-xs text-muted">{season.episodes?.length || 0} Episodes</span>
            </div>
            
            {activeSeason === season.id && (
              <div className="p-6 bg-surface-elevated/20 space-y-4 border-t border-white/5">
                {season.episodes?.map((ep: any) => (
                  <div key={ep.id} className="flex items-center justify-between bg-black/30 px-4 py-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-4">
                      <span className="text-primary font-bold text-sm">E{ep.episodeNumber}</span>
                      <span className="text-foreground font-medium text-sm">{ep.title}</span>
                    </div>
                  </div>
                ))}

                <div className="flex gap-4 items-center pt-2">
                  <input
                    type="number"
                    value={epNumber}
                    onChange={e => setEpNumber(e.target.value)}
                    placeholder="Ep #"
                    className="w-20 bg-surface border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                  />
                  <input
                    type="text"
                    value={epTitle}
                    onChange={e => setEpTitle(e.target.value)}
                    placeholder="Episode Title"
                    className="flex-1 bg-surface border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                  />
                  <Button onClick={() => handleAddEpisode(season.id)} disabled={loading || !epNumber || !epTitle} size="sm" variant="secondary">
                    Add Episode
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
