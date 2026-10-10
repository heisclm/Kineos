"use client";

import { useState } from "react";
import { MovieCard } from "@/components/movie/MovieCard";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface RelatedItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  shortTeaser?: string | null;
  imageUrl?: string | null;
  genre?: string | null;
  primaryGenre?: string | null;
  releaseDate?: string | Date | null;
  rating?: string | null;
  ratingScore?: number | null;
  runtime?: number | null;
  seasonsCount?: number | null;
  [key: string]: any;
}

interface MoreLikeThisSectionProps {
  items: RelatedItem[];
  type?: "movie" | "series";
}

export function MoreLikeThisSection({ items, type = "movie" }: MoreLikeThisSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-4 sm:px-6 md:px-10 max-w-[1920px] mx-auto mt-16 sm:mt-20 md:mt-24">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 sm:h-7 rounded-full bg-primary shadow-sm shadow-primary/50" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            More Like This
          </h2>
        </div>
      </div>

      {/* Responsive Recommendation Grid */}
      {/* Breakpoints: 
          - < sm (mobile, 2 cols): 6 cards visible (3 rows of 2)
          - sm to lg (tablet, 3 cols): 6 cards visible (2 rows of 3)
          - lg to xl (desktop, 4 cols): 8 cards visible (2 rows of 4)
          - xl+ (ultra-wide, 6 cols): 12 cards visible (2 rows of 6)
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4 md:gap-6">
        {items.map((item, index) => {
          let visibilityClass = "block";

          if (!isExpanded) {
            if (index >= 8) {
              // Cards 9-12: Hidden on mobile, tablet & desktop; visible only on xl (6 cols)
              visibilityClass = "hidden xl:block";
            } else if (index >= 6) {
              // Cards 7-8: Hidden on mobile (2 cols) & tablet (3 cols); visible on desktop (4 cols) and xl
              visibilityClass = "hidden lg:block";
            }
          }

          return (
            <div key={item.id} className={visibilityClass}>
              <MovieCard
                id={item.id}
                title={item.title}
                slug={item.slug}
                description={item.description || ""}
                shortTeaser={item.shortTeaser}
                imageUrl={item.imageUrl}
                primaryGenre={item.primaryGenre || item.genre || (type === "movie" ? "Movie" : "TV Series")}
                type={type}
                releaseDate={item.releaseDate}
                rating={item.rating}
                ratingScore={item.ratingScore}
                runtime={item.runtime}
                seasonsCount={item.seasonsCount}
              />
            </div>
          );
        })}
      </div>

      {/* Netflix-style Show More / Show Less Pill for Mobile, Tablet, and Desktop */}
      {items.length > 6 && (
        <div className="mt-8 sm:mt-10 flex justify-center xl:hidden">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="group px-5 py-2.5 rounded-full bg-surface/80 hover:bg-surface border border-white/10 hover:border-primary/40 text-xs sm:text-sm font-semibold text-foreground/90 hover:text-primary transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 backdrop-blur-sm"
          >
            <span>{isExpanded ? "Show Less" : "Show More"}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
            )}
          </button>
        </div>
      )}
    </section>
  );
}
