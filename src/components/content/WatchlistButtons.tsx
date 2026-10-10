"use client";

import { useWatchlist, WatchlistItem } from "@/lib/watchlist";
import { Plus, Check, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface WatchlistCardButtonProps {
  item: WatchlistItem;
  className?: string;
}

export function WatchlistCardButton({ item, className }: WatchlistCardButtonProps) {
  const { isInWatchlist, toggleWatchlist, isLoaded } = useWatchlist();
  const inList = isLoaded && isInWatchlist(item.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(item);
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      title={inList ? "Remove from My List" : "Add to My List"}
      aria-label={inList ? "Remove from My List" : "Add to My List"}
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg backdrop-blur-md cursor-pointer select-none",
        inList
          ? "bg-primary text-primary-foreground shadow-primary/40 scale-100 border border-primary/60"
          : "bg-black/60 hover:bg-black/85 text-white/80 hover:text-white border border-white/20 hover:border-white/50 opacity-90 sm:opacity-0 group-hover:opacity-100 hover:scale-108",
        className
      )}
    >
      {inList ? (
        <Check className="w-4 h-4 stroke-[2.5]" />
      ) : (
        <Plus className="w-4 h-4 stroke-[2.5]" />
      )}
    </button>
  );
}

interface WatchlistDetailButtonProps {
  item: WatchlistItem;
  className?: string;
}

export function WatchlistDetailButton({ item, className }: WatchlistDetailButtonProps) {
  const { isInWatchlist, toggleWatchlist, isLoaded } = useWatchlist();
  const inList = isLoaded && isInWatchlist(item.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWatchlist(item);
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={cn(
        "h-10 sm:h-11 px-4 sm:px-5 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 border shadow-md active:scale-95 cursor-pointer",
        inList
          ? "bg-primary/20 text-primary border-primary/40 hover:bg-primary/30 shadow-primary/10"
          : "bg-surface/80 hover:bg-surface-elevated text-foreground border-white/10 hover:border-white/25",
        className
      )}
    >
      {inList ? (
        <>
          <Check className="w-4 h-4 stroke-[2.5] text-primary" />
          <span>In My List</span>
        </>
      ) : (
        <>
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add to List</span>
        </>
      )}
    </button>
  );
}
