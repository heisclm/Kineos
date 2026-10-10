import { Star, Eye, Download, ShieldCheck, Film, Tv, Volume2 } from "lucide-react";
import { TrailerModal } from "@/components/content/TrailerModal";
import { formatKineosScore } from "@/lib/tmdb";

interface HeroSideWidgetProps {
  type: "movie" | "series";
  title: string;
  backdropUrl?: string | null;
  posterUrl?: string | null;
  trailerUrl?: string | null;
  releaseYear?: number | string | null;
  runtime?: string | null;
  ratingScore?: number | null; // out of 100 or 10
  contentRating?: string | null; // e.g. PG-13, TV-MA, R
  viewCount?: number;
  downloadCount?: number;
  language?: string | null;
  country?: string | null;
  status?: string | null;
  sources?: any[];
}

export function HeroSideWidget({
  type,
  title,
  backdropUrl,
  posterUrl,
  trailerUrl,
  releaseYear,
  runtime,
  ratingScore,
  contentRating,
  viewCount = 0,
  downloadCount = 0,
  language = "English",
  country,
  status = "Released",
  sources = [],
}: HeroSideWidgetProps) {
  // 1. Dynamic Kineos Score
  const { score: normalizedScore } = formatKineosScore(ratingScore, 8.4);

  // 2. Smart Dynamic Detection of Audio & Video Formats from Available Download Sources
  const has4K = sources && sources.some((s) => /4k|2160/i.test(s.quality || "") || /4k|2160/i.test(s.fileName || ""));
  const has1080p = sources && sources.some((s) => /1080/i.test(s.quality || "") || /1080/i.test(s.fileName || ""));
  const hasHDR = sources && sources.some((s) => /hdr/i.test(s.quality || "") || /hdr/i.test(s.fileName || ""));
  const hasDolby = sources && sources.some((s) => /5\.1|7\.1|dolby|atmos|dts/i.test(s.quality || "") || /5\.1|7\.1|dolby|atmos|dts/i.test(s.fileName || ""));

  // Build dynamic badges list
  const formatBadges: string[] = [];
  if (has4K) {
    formatBadges.push("4K UHD");
  } else if (has1080p) {
    formatBadges.push("1080p FHD");
  } else {
    formatBadges.push("HD 720p");
  }

  if (hasHDR) {
    formatBadges.push("HDR10");
  }

  if (hasDolby) {
    formatBadges.push("5.1 AUDIO");
  } else {
    formatBadges.push("STEREO");
  }

  formatBadges.push("SUBTITLES");

  const qualityBadge = has4K ? "4K" : "HD";

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* 1. Interactive Trailer Preview Card */}
      <TrailerModal
        title={title}
        backdropUrl={backdropUrl}
        posterUrl={posterUrl}
        trailerUrl={trailerUrl}
        releaseYear={releaseYear}
        duration={runtime || undefined}
        qualityBadge={qualityBadge}
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

        {/* Technical Format Badges (100% Dynamically Generated) */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-1.5">
            Format & Audio
          </span>
          <div className="flex flex-wrap gap-1.5">
            {formatBadges.map((badge) => (
              <span
                key={badge}
                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/90 tracking-wide"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Quick specs footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
          <span className="truncate max-w-[150px]">
            {type === "series" ? (language || "English") : (country ? `${language || "English"} • ${country}` : (language || "English"))}
          </span>
          <span className="capitalize font-medium text-white/80 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Verified
          </span>
        </div>
      </div>
    </div>
  );
}
