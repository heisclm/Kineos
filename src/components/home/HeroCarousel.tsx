"use client";

import { Play, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HeroFeaturedProps {
  movies: any[]; // Array of movies
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

  const movie = movies[currentIndex];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % movies.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);

  return (
    <div className="relative w-full h-[380px] md:h-[450px] lg:h-[550px] rounded-xl md:rounded-2xl overflow-hidden bg-surface flex group shadow-sm border border-white/5 transition-apple">
      {/* Background/Artwork with Cinematic Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent z-10 w-full md:w-3/4 lg:w-2/3" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 h-full opacity-90 md:opacity-80" />
      
      {/* Abstract gradient placeholder (simulates vibrant movie artwork) */}
      {(movie.backdropUrl || movie.imageUrl) ? (
        <Image
          key={movie.id}
          src={movie.backdropUrl || movie.imageUrl}
          alt={movie.title}
          fill
          className="object-cover z-0 opacity-50 md:opacity-60 animate-in fade-in duration-1000"
          priority
        />
      ) : (
        <div 
          key={movie.id}
          className="absolute inset-0 bg-gradient-to-bl from-primary/30 via-transparent to-transparent z-0 opacity-40 md:opacity-50 animate-in fade-in duration-1000" 
        />
      )}
      
      {/* Content */}
      <div 
        key={`content-${movie.id}`} 
        className="relative z-20 w-full md:w-3/4 lg:w-1/2 p-6 pb-16 md:p-12 flex flex-col justify-end md:justify-center h-full animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-6">
          {movie.genres?.slice(0, 3).map((g: string) => (
            <Badge key={g} variant="glass" className="px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-[11px] uppercase tracking-wider font-semibold rounded-pill bg-white/5 text-white/80 border-white/10 backdrop-blur-md">
              {g}
            </Badge>
          ))}
        </div>
        
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 md:mb-4 tracking-tighter leading-[1.1] drop-shadow-md">
          {movie.title}
        </h2>
        
        <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground font-medium mb-4 md:mb-6 drop-shadow-sm">
          <span>{movie.seoTitle?.match(/\((\d{4})\)/)?.[1] || new Date().getFullYear()}</span>
          <span>•</span>
          <span>PG-13</span>
          <span>•</span>
          <span>2h 20m</span>
        </div>

        <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 md:mb-8 line-clamp-3 md:line-clamp-4 max-w-lg drop-shadow-sm">
          {movie.description}
        </p>

        <div className="flex flex-wrap items-center gap-5 md:gap-6">
          <Link href={`/movies/${movie.slug}`}>
            <Button size="lg" className="rounded-pill px-6 md:px-8 gap-2 font-semibold shadow-lg hover:scale-105 transition-apple bg-primary text-primary-foreground">
              <Play className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" /> Play
            </Button>
          </Link>
          <Link href={`/movies/${movie.slug}#download`}>
            <Button size="lg" variant="glass" className="rounded-pill px-6 md:px-8 gap-2 font-semibold hover:bg-white/10 hover:scale-105 transition-apple backdrop-blur-md border border-white/10 bg-white/5 text-foreground">
              <Download className="w-4 h-4 md:w-5 md:h-5" /> Download
            </Button>
          </Link>
        </div>
      </div>

      {/* Slideshow Controls */}
      {movies.length > 1 && (
        <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2">
          <button 
            onClick={prevSlide}
            className="w-10 h-10 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-foreground transition-apple hover:scale-105 hidden md:flex"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextSlide}
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
