"use client";

import { useState } from "react";
import { MovieCard } from "@/components/movie/MovieCard";
import { Film, Tv, Sparkles } from "lucide-react";

interface CreditItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  shortTeaser?: string | null;
  imageUrl?: string | null;
  primaryGenre?: string;
  type: "movie" | "series";
  releaseDate?: string | Date | null;
  rating?: string | null;
  ratingScore?: number | null;
  runtime?: number | null;
  roleName?: string | null;
  seasonsCount?: number | null;
}

interface CastFilmographyViewProps {
  movies: CreditItem[];
  series: CreditItem[];
  actorName: string;
}

export function CastFilmographyView({ movies, series, actorName }: CastFilmographyViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "movie" | "series">("all");

  const allItems: CreditItem[] = [
    ...movies.map((m) => ({ ...m, type: "movie" as const })),
    ...series.map((s) => ({ ...s, type: "series" as const })),
  ].sort((a, b) => {
    const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
    const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
    return dateB - dateA;
  });

  const displayedItems =
    activeTab === "movie" ? movies : activeTab === "series" ? series : allItems;

  return (
    <div className="w-full space-y-8">
      {/* Tab Filter Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "all"
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-surface hover:bg-surface-elevated text-white/70 hover:text-white border border-white/5"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Titles</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/30">
              {allItems.length}
            </span>
          </button>

          {movies.length > 0 && (
            <button
              onClick={() => setActiveTab("movie")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "movie"
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "bg-surface hover:bg-surface-elevated text-white/70 hover:text-white border border-white/5"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/30">
                {movies.length}
              </span>
            </button>
          )}

          {series.length > 0 && (
            <button
              onClick={() => setActiveTab("series")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "series"
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "bg-surface hover:bg-surface-elevated text-white/70 hover:text-white border border-white/5"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>TV Series</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/30">
                {series.length}
              </span>
            </button>
          )}
        </div>

        <p className="text-xs text-white/50 font-medium">
          Showing {displayedItems.length} {displayedItems.length === 1 ? "credit" : "credits"} for{" "}
          <span className="text-white/80">{actorName}</span>
        </p>
      </div>

      {/* Filmography Grid */}
      {displayedItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
          {displayedItems.map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex flex-col gap-2">
              <MovieCard
                id={item.id}
                title={item.title}
                slug={item.slug}
                imageUrl={item.imageUrl}
                primaryGenre={item.primaryGenre}
                type={item.type}
                releaseDate={item.releaseDate}
                rating={item.rating}
                ratingScore={item.ratingScore}
                runtime={item.runtime}
                seasonsCount={item.seasonsCount}
                shortTeaser={item.shortTeaser || item.description}
              />
              {item.roleName && (
                <div className="px-1 text-[11px] text-white/55 truncate">
                  <span className="text-white/35 font-medium">as </span>
                  <span className="font-semibold text-white/85">{item.roleName}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl bg-surface border border-white/5">
          <p className="text-base text-white/60 font-medium">
            No titles found under this category.
          </p>
        </div>
      )}
    </div>
  );
}
