import Image from "next/image";
import Link from "next/link";
import { Play, Download, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

interface CatalogSpotlightProps {
  item: any;
  type: "movie" | "series";
}

export function CatalogSpotlight({ item, type }: CatalogSpotlightProps) {
  if (!item) return null;

  const isSeries = type === "series";
  const href = isSeries ? `/series/${item.slug}` : `/movies/${item.slug}`;
  const year = item.releaseDate ? new Date(item.releaseDate).getFullYear() : null;
  const score = item.ratingScore ? (item.ratingScore / 10).toFixed(1) : "8.4";
  const artwork = item.backdropUrl || item.imageUrl;

  return (
    <div className="relative w-full h-[360px] sm:h-[400px] md:h-[460px] rounded-2xl overflow-hidden bg-surface-elevated border border-white/10 shadow-2xl mb-8 group">
      {/* Background Backdrop Artwork */}
      {artwork && (
        <Image
          src={artwork}
          alt={item.title}
          fill
          sizes="100vw"
          className="object-cover opacity-45 group-hover:opacity-55 transition-opacity duration-700 object-center"
          priority
        />
      )}

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent w-full md:w-3/4 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 h-full p-6 sm:p-8 md:p-12 flex flex-col justify-end md:justify-center max-w-2xl">
        {/* Spotlight Pill strip */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-primary/25 text-primary border-primary/30">
            {isSeries ? "SPOTLIGHT SERIES" : "SPOTLIGHT MOVIE"}
          </Badge>

          <Badge variant="glass" className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-black/60 text-white/90 border-white/15">
            4K UHD
          </Badge>

          {item.genres?.slice(0, 2).map((g: string) => (
            <Badge key={g} variant="glass" className="px-2 py-0.5 text-[10px] rounded-full bg-white/5 text-white/80 border-white/10">
              {g}
            </Badge>
          ))}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight mb-2.5 drop-shadow-lg">
          {item.title}
        </h2>

        {/* Specs */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-white/80 font-medium mb-3.5 drop-shadow-md">
          {year && <span>{year}</span>}

          {item.rating && (
            <>
              <span>&bull;</span>
              <span className="px-1.5 py-0.2 rounded border border-white/20 text-[10px] font-bold text-white/90 uppercase bg-white/5">
                {item.rating}
              </span>
            </>
          )}

          <span>&bull;</span>
          <span className="flex items-center gap-1 font-semibold text-primary">
            <Star className="w-3.5 h-3.5 fill-primary text-primary" strokeWidth={2.2} />
            {score}
          </span>

          {item.runtime && !isSeries && (
            <>
              <span>&bull;</span>
              <span>{formatDuration(item.runtime)}</span>
            </>
          )}
        </div>

        {/* Logline */}
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 mb-6 leading-relaxed max-w-xl">
          {item.shortTeaser || item.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Link href={href}>
            <Button size="default" className="rounded-full px-6 gap-2 font-bold bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-apple">
              <Play className="w-4 h-4" fill="currentColor" /> Stream Now
            </Button>
          </Link>
          <Link href={`${href}#download`}>
            <Button size="default" variant="glass" className="rounded-full px-6 gap-2 font-semibold border border-white/15 bg-white/5 hover:bg-white/10 transition-apple">
              <Download className="w-4 h-4" /> Download
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
