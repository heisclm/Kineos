"use client";

import { useState } from "react";
import { useWatchlist } from "@/lib/watchlist";
import { MovieCard } from "@/components/movie/MovieCard";
import { Bookmark, Film, Tv, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function WatchlistPage() {
  const { items, count, isLoaded } = useWatchlist();
  const [filter, setFilter] = useState<"all" | "movie" | "series">("all");

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  return (
    <div className="w-full min-h-[70vh] pt-3 sm:pt-4 md:pt-5 pb-16 px-4 sm:px-6 md:px-10 max-w-[1920px] mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Left Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Watchlist" },
        ]}
        className="mb-4 sm:mb-6"
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-7 rounded-full bg-primary shadow-sm shadow-primary/50" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              My Watchlist
            </h1>
            {isLoaded && count > 0 && (
              <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs sm:text-sm font-bold">
                {count} {count === 1 ? "Title" : "Titles"}
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-muted max-w-xl">
            Your personal saved queue. Stream, download, and track your favorite movies and series in one place.
          </p>
        </div>

        {/* Filter Pills */}
        {isLoaded && count > 0 && (
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-surface border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setFilter("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === "all"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted hover:text-white"
              }`}
            >
              All ({count})
            </button>
            <button
              onClick={() => setFilter("movie")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filter === "movie"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted hover:text-white"
              }`}
            >
              <Film className="w-3 h-3" />
              <span>Movies ({items.filter((i) => i.type === "movie").length})</span>
            </button>
            <button
              onClick={() => setFilter("series")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filter === "series"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted hover:text-white"
              }`}
            >
              <Tv className="w-3 h-3" />
              <span>Series ({items.filter((i) => i.type === "series").length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-surface/50 border border-white/5" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {isLoaded && count === 0 && (
        <div className="py-20 sm:py-28 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-surface-elevated/60 border border-white/10 flex items-center justify-center mb-6 shadow-xl text-primary">
            <Bookmark className="w-9 h-9 stroke-[1.8]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">
            Your Watchlist is Empty
          </h2>
          <p className="text-sm sm:text-base text-muted mb-8 leading-relaxed">
            Never lose track of what to watch next. Tap the <span className="text-primary font-bold">+</span> bookmark button on any movie or series to save it here instantly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/movies">
              <Button size="lg" className="rounded-full px-6 font-semibold bg-primary text-primary-foreground gap-2">
                <Film className="w-4 h-4" /> Browse Movies
              </Button>
            </Link>
            <Link href="/series">
              <Button size="lg" variant="outline" className="rounded-full px-6 font-semibold border-white/10 hover:bg-white/10 gap-2">
                <Tv className="w-4 h-4" /> Browse Series
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Grid of Saved Titles */}
      {isLoaded && count > 0 && (
        <>
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-muted">
              No {filter === "movie" ? "movies" : "series"} found in your watchlist.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
              {filteredItems.map((item) => (
                <MovieCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  slug={item.slug}
                  description={item.shortTeaser || ""}
                  shortTeaser={item.shortTeaser}
                  imageUrl={item.imageUrl}
                  primaryGenre={item.primaryGenre || (item.type === "movie" ? "Movie" : "Series")}
                  type={item.type}
                  releaseDate={item.releaseDate}
                  rating={item.rating}
                  ratingScore={item.ratingScore}
                  runtime={item.runtime}
                  seasonsCount={item.seasonsCount}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
