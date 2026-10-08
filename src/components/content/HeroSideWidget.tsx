import { Star, Eye, Download, ShieldCheck, Film, Tv, Volume2 } from "lucide-react";
import { TrailerModal } from "@/components/content/TrailerModal";

interface HeroSideWidgetProps {
  type: "movie" | "series";
  title: string;
  backdropUrl?: string | null;
  posterUrl?: string | null;
  releaseYear?: number | string | null;
  runtime?: string | null;
  ratingScore?: number | null; // out of 100 or 10
  contentRating?: string | null; // e.g. PG-13, TV-MA, R
  viewCount?: number;
  downloadCount?: number;
  language?: string | null;
  country?: string | null;
  status?: string | null;
}

export function HeroSideWidget({
  type,
  title,
  backdropUrl,
  posterUrl,
  releaseYear,
  runtime,
  ratingScore,
  contentRating,
  viewCount = 0,
  downloadCount = 0,
  language = "English",
  country,
  status = "Released",
}: HeroSideWidgetProps) {
  // Convert rating score to a 10-point scale
  const normalizedScore = ratingScore
    ? ratingScore > 10
      ? (ratingScore / 10).toFixed(1)
      : ratingScore.toFixed(1)
    : "8.4";

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* 1. Interactive Trailer Preview Card */}
      <TrailerModal
        title={title}
        backdropUrl={backdropUrl}
        posterUrl={posterUrl}
        releaseYear={releaseYear}
        duration={runtime || undefined}
        variant="card"
      />

      {/* 2. Audio/Visual Specs & Ratings Widget */}
      <div className="p-4 rounded-2xl bg-surface/60 backdrop-blur-md border border-white/10 shadow-lg space-y-3">
        {/* Rating & Popularity Row */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 border border-primary/30">
              <Star className="w-4 h-4 fill-primary text-primary" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold text-foreground">{normalizedScore}</span>
                <span className="text-[11px] text-muted-foreground font-medium">/ 10</span>
              </div>
              <span className="text-[10px] text-white/50 block -mt-0.5">Kineos Score</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-xs font-semibold text-white/90">
              <Eye className="w-3.5 h-3.5 text-white/50" />
              <span>{(viewCount || 100).toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-white/50 block">{(downloadCount || 0).toLocaleString()} downloads</span>
          </div>
        </div>

        {/* Technical Format Badges */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-1.5">
            Format & Audio
          </span>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/90 tracking-wide">
              4K UHD
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/90 tracking-wide">
              HDR10
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/90 tracking-wide">
              5.1 AUDIO
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/90 tracking-wide">
              SUBTITLES
            </span>
          </div>
        </div>

        {/* Quick specs footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
          <span className="truncate max-w-[150px]">{language || "English"} &bull; {country || "Global"}</span>
          <span className="capitalize font-medium text-white/80 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Verified
          </span>
        </div>
      </div>
    </div>
  );
}
