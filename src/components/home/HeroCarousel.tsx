"use client";

import { Play, Download, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn, formatDuration } from "@/lib/utils";

interface HeroFeaturedProps {
  movies: any[]; // Array of movies or series
}

export function HeroCarousel({ movies }: HeroFeaturedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!movies || movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000); // 8 second slide
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const item = movies[currentIndex];
  const isSeries = item.type === "series" || Boolean((item as any).seasons);
  const detailHref = isSeries ? `/series/${item.slug}` : `/movies/${item.slug}`;
  const score = item.ratingScore ? (item.ratingScore / 10).toFixed(1) : "8.4";

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % movies.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);

  return (
    <div className="relative w-full h-[520px] sm:h-[540px] md:h-[600px] lg:h-[680px] rounded-none overflow-hidden bg-background flex group border-0 shadow-none transition-apple">
      {/* Background/Artwork with Cinematic Gradients on ALL devices */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 via-25% to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 via-40% to-transparent z-10 w-full md:w-4/5 lg:w-3/5 pointer-events-none" />
      
      {/* Backdrop Artwork */}
      {(item.backdropUrl || item.imageUrl) ? (
        <Image
          key={item.id}
          src={item.backdropUrl || item.imageUrl}
          alt={item.title}
          fill
          sizes="100vw"
          className="object-cover z-0 opacity-55 md:opacity-65 animate-in fade-in duration-1000 object-center"
          priority
        />
      ) : (
        <div 
          key={item.id}
          className="absolute inset-0 bg-gradient-to-bl from-primary/30 via-transparent to-transparent z-0 opacity-40 md:opacity-50 animate-in fade-in duration-1000" 
        />
      )}
      
      {/* Content Container aligned with site grid */}
      <div 
        key={`content-${item.id}`} 
        className="relative z-20 w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 pb-14 pt-20 md:pb-16 md:pt-24 flex flex-col justify-end md:justify-center h-full animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        <div className="max-w-xl lg:max-w-2xl">
          {/* Badges strip: Type + Genres */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5 md:mb-5">
          <Badge className="px-2.5 py-0.5 text-[10px] md:text-[11px] uppercase tracking-wider font-extrabold rounded-full bg-primary/25 text-primary border-primary/35">
            {isSeries ? "TV SERIES" : "FEATURED MOVIE"}
          </Badge>

          {item.genres?.slice(0, 2).map((g: string) => (
            <Badge key={g} variant="glass" className="px-2.5 py-0.5 text-[10px] md:text-[11px] font-medium rounded-full bg-white/5 text-white/80 border-white/10 backdrop-blur-md">
              {g}
            </Badge>
          ))}
        </div>
        
        {/* Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-3 md:mb-4 tracking-tight leading-[1.08] drop-shadow-2xl">
          {item.title}
        </h2>
        
        {/* Metadata Specs Row (Netflix / IMDb style: Year • Age Rating • Score • Runtime) */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs md:text-sm text-white/80 font-medium mb-4 md:mb-6 drop-shadow-md">
          {item.releaseDate && <span>{new Date(item.releaseDate).getFullYear()}</span>}

          {item.rating && (
            <>
              <span>&bull;</span>
              <span className="px-1.5 py-0.2 rounded border border-white/20 text-[10px] font-bold text-white/90 uppercase tracking-wide bg-white/5">
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

          {isSeries && (item as any).seasons && (
            <>
              <span>&bull;</span>
              <span>{(item as any).seasons.length} Seasons</span>
            </>
          )}
        </div>

        {/* Synopsis */}
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed mb-6 md:mb-8 max-w-xl line-clamp-3 drop-shadow-sm">
          {item.shortTeaser || item.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-4 md:gap-5">
          <Link href={detailHref}>
            <Button size="lg" className="rounded-full px-7 md:px-9 gap-2.5 font-bold shadow-xl shadow-primary/25 hover:scale-105 transition-apple bg-primary text-primary-foreground">
              <Play className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" /> Stream Now
            </Button>
          </Link>
          <Link href={`${detailHref}#download`}>
            <Button size="lg" variant="glass" className="rounded-full px-7 md:px-9 gap-2.5 font-semibold hover:bg-white/10 hover:scale-105 transition-apple backdrop-blur-md border border-white/15 bg-white/5 text-foreground">
              <Download className="w-4 h-4 md:w-5 md:h-5" /> Download
            </Button>
          </Link>
        </div>
        </div>
      </div>

      {/* Slideshow Controls */}
      {movies.length > 1 && (
        <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2">
          <button 
            onClick={prevSlide}
            aria-label="Previous slide"
            className="w-10 h-10 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-foreground transition-apple hover:scale-105 hidden md:flex"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextSlide}
            aria-label="Next slide"
            className="w-10 h-10 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-foreground transition-apple hover:scale-105 hidden md:flex"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Progress Indicators */}
      {movies.length > 1 && (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-32 z-30 flex items-center gap-1.5">
          {movies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                idx === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
