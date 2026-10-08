import Image from "next/image";
import Link from "next/link";
import { Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";

export interface MovieCardProps {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  shortTeaser?: string | null;
  imageUrl?: string | null;
  primaryGenre?: string;
  type?: "movie" | "series";
  releaseDate?: string | Date | null;
  rating?: string | null;
  ratingScore?: number | null;
  runtime?: number | null;
  qualityBadge?: string | null;
  seasonsCount?: number | null;
}

export function MovieCard({
  title,
  slug,
  description,
  shortTeaser,
  imageUrl,
  primaryGenre,
  type = "movie",
  releaseDate,
  rating,
  ratingScore,
  runtime,
  qualityBadge = "HD",
  seasonsCount,
}: MovieCardProps) {
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const score = ratingScore ? (ratingScore / 10).toFixed(1) : null;

  return (
    <Link
      href={type === "series" ? `/series/${slug}` : `/movies/${slug}`}
      className="group block relative rounded-xl overflow-hidden bg-surface transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 shadow-md hover:shadow-2xl hover:shadow-primary/10 border border-white/5 hover:border-white/15"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-elevated">
        {/* Placeholder gradient for missing images */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated to-surface-overlay z-0" />

        {/* Poster Image */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
            className="object-cover z-10 transition-transform duration-500 ease-out group-hover:scale-108"
          />
        ) : (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4 text-center">
            <span className="text-xs font-semibold text-white/40">{title}</span>
          </div>
        )}

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-20 opacity-90 group-hover:opacity-95 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent z-20 opacity-40 group-hover:opacity-70 transition-opacity duration-300" />

        {/* Top Badges Row */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between pointer-events-none">
          {primaryGenre ? (
            <Badge
              variant="glass"
              className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border-white/15 text-white/90 font-medium"
            >
              {primaryGenre}
            </Badge>
          ) : <span />}

          <div className="flex items-center gap-1">
            {type === "series" && (
              <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/25 text-primary border border-primary/30 backdrop-blur-md">
                TV
              </span>
            )}
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/60 text-white/80 border border-white/10 backdrop-blur-md">
              {qualityBadge || "HD"}
            </span>
          </div>
        </div>

        {/* Center Hover Action: Netflix-style Play Button */}
        <div className="absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 flex items-center justify-center backdrop-blur-md transition-transform group-hover:scale-105">
            <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Bottom Content: Title + Specs + Teaser */}
        <div className="absolute bottom-0 left-0 w-full p-3.5 z-30 flex flex-col justify-end">
          {/* Title */}
          <h4 className="text-foreground font-bold text-sm sm:text-base leading-tight mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h4>

          {/* Metadata Specs Row (Netflix / IMDb style: 2026 • ★ 8.4 • TV-MA • 1h 36m) */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] font-medium text-white/70 mb-1">
            {year && <span>{year}</span>}

            {score && (
              <>
                {year && <span className="text-white/30">&bull;</span>}
                <span className="flex items-center gap-0.5 text-primary font-semibold">
                  <Star className="w-3 h-3 fill-primary text-primary" strokeWidth={2.2} />
                  {score}
                </span>
              </>
            )}

            {rating && (
              <>
                {(year || score) && <span className="text-white/30">&bull;</span>}
                <span className="px-1 py-0.2 rounded border border-white/20 text-[9px] font-bold text-white/90 bg-white/5 uppercase">
                  {rating}
                </span>
              </>
            )}

            {type === "series" && seasonsCount ? (
              <>
                <span className="text-white/30">&bull;</span>
                <span className="text-[10px] text-white/60">{seasonsCount} {seasonsCount === 1 ? 'Season' : 'Seasons'}</span>
              </>
            ) : runtime ? (
              <>
                <span className="text-white/30">&bull;</span>
                <span className="text-[10px] text-white/60">{formatDuration(runtime)}</span>
              </>
            ) : null}
          </div>

          {/* Expanding Teaser on Hover */}
          {(shortTeaser || description) && (
            <p className="text-muted text-[11px] line-clamp-2 max-h-0 opacity-0 group-hover:max-h-12 group-hover:opacity-100 transition-all duration-300 ease-out">
              {shortTeaser || description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
