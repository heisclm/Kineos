"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, X, Film, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractYouTubeId, getYouTubeEmbedUrl } from "@/lib/tmdb";

interface TrailerModalProps {
  title: string;
  backdropUrl?: string | null;
  posterUrl?: string | null;
  trailerUrl?: string | null;
  releaseYear?: number | string | null;
  duration?: string;
  qualityBadge?: string;
  variant?: "card" | "button";
  buttonText?: string;
  className?: string;
}

export function TrailerModal({
  title,
  backdropUrl,
  posterUrl,
  trailerUrl,
  releaseYear,
  duration,
  qualityBadge = "HD",
  variant = "card",
  buttonText = "Watch Trailer",
  className = "",
}: TrailerModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Determine video embed source
  const videoId = extractYouTubeId(trailerUrl);
  const embedSrc = getYouTubeEmbedUrl(trailerUrl, title, releaseYear);

  const youtubeDirectLink = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${releaseYear || ""} official trailer`.trim())}`;

  const thumbnail = backdropUrl || posterUrl;

  return (
    <>
      {variant === "button" ? (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`rounded-full gap-2 font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:scale-105 transition-apple shadow-lg ${className}`}
        >
          <Play className="w-4 h-4 fill-primary text-primary" /> {buttonText}
        </Button>
      ) : (
        /* Far-Right Trailer Video Card (Desktop & Widescreen) */
        <div
          onClick={() => setIsOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsOpen(true);
          }}
          className={`group relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-surface-elevated/60 backdrop-blur-md border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] cursor-pointer hover:border-primary/50 transition-all duration-300 ${className}`}
        >
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={`${title} Trailer Preview`}
              fill
              sizes="(max-width: 1280px) 100vw, 380px"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-90"
            />
          ) : (
            <div className="absolute inset-0 bg-surface flex items-center justify-center">
              <Film className="w-12 h-12 text-white/20" />
            </div>
          )}

          {/* Dark Cinematic Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:via-black/25 transition-colors" />

          {/* Centered Glowing Play Button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
            <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
              <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-white/90 drop-shadow-md group-hover:text-primary transition-colors">
              Play Trailer
            </span>
          </div>

          {/* Card Footer Bar */}
          <div className="absolute bottom-0 inset-x-0 p-3 flex items-center justify-between text-[11px] font-semibold text-white/90 z-10 bg-gradient-to-t from-black/80 to-transparent">
            <span className="flex items-center gap-1.5 truncate max-w-[200px]">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" /> Official Trailer
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {duration && (
                <span className="px-1.5 py-0.5 rounded bg-black/60 border border-white/15 text-[10px] text-white/80">
                  {duration}
                </span>
              )}
              <span className="px-1.5 py-0.5 rounded bg-primary/20 border border-primary/30 text-[10px] font-bold text-primary">
                {qualityBadge}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Video Player Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-surface border border-white/15 rounded-2xl md:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-surface-elevated/70">
              <div className="flex items-center gap-2 min-w-0">
                <Play className="w-4 h-4 fill-primary text-primary shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                  {title} &mdash; Official Trailer
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={youtubeDirectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-white/70 hover:text-white px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  YouTube
                </a>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close trailer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Iframe Container */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={embedSrc}
                title={`${title} Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
