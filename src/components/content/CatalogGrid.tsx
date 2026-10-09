"use client";

import { useState, useEffect } from "react";
import { MovieCard } from "@/components/movie/MovieCard";
import { Button } from "@/components/ui/button";
import { fetchCatalogItems } from "@/features/content/catalog.actions";
import { Loader2 } from "lucide-react";

interface CatalogGridProps {
  initialItems: any[];
  type: "movie" | "series";
  genre?: string;
  sort?: string;
  totalCount?: number;
}

export function CatalogGrid({ initialItems, type, genre, sort, totalCount }: CatalogGridProps) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length >= 30);

  useEffect(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(initialItems.length >= 30 && (totalCount ? initialItems.length < totalCount : true));
  }, [initialItems, totalCount]);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      const nextPage = page + 1;
      const newItems = await fetchCatalogItems(type, nextPage, 30, genre, sort);
      
      if (newItems.length < 30) {
        setHasMore(false);
      }
      
      setItems(prev => {
        const existingIds = new Set(prev.map(i => i.id));
        const unique = newItems.filter(i => !existingIds.has(i.id));
        const combined = [...prev, ...unique];
        if (totalCount && combined.length >= totalCount) {
          setHasMore(false);
        }
        return combined;
      });
      setPage(nextPage);
    } catch (error) {
      console.error("Failed to load more items", error);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-xl font-medium text-foreground">No {type === 'movie' ? 'movies' : 'series'} found.</p>
        <p className="text-muted mt-2">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 relative z-0">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in fade-in duration-300">
        {items.map((item) => (
          <MovieCard
            key={item.id}
            {...item}
            type={type}
            primaryGenre={item.genres?.[0] || (type === 'movie' ? 'Movie' : 'Series')}
            imageUrl={item.imageUrl || ""}
          />
        ))}
      </div>

      <div className="flex flex-col items-center justify-center gap-3 pt-6 pb-2">
        {hasMore ? (
          <>
            <Button 
              onClick={loadMore} 
              disabled={loading}
              size="lg"
              className="rounded-full px-8 bg-surface-elevated hover:bg-surface-elevated/80 text-foreground border border-white/10 shadow-lg font-semibold transition-apple hover:scale-105 active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {loading ? "Loading Titles..." : `Load More ${type === 'movie' ? 'Movies' : 'Series'}`}
            </Button>
            <p className="text-xs text-white/50 font-medium">
              Showing {items.length}{totalCount ? ` of ${totalCount}` : ""} titles
            </p>
          </>
        ) : items.length > 15 ? (
          <div className="flex items-center gap-3 text-xs text-white/40 font-medium py-4">
            <span className="w-12 h-px bg-white/10" />
            <span>You&apos;ve reached the end of the catalog ({items.length} titles)</span>
            <span className="w-12 h-px bg-white/10" />
          </div>
        ) : null}
      </div>
    </div>
  );
}


