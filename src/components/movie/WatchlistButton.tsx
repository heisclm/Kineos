"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toggleWatchlist } from "@/features/watchlist/watchlist.actions";
import { useRouter } from "next/navigation";

interface WatchlistButtonProps {
  contentId: string;
  contentType: "movie" | "series";
  initialIsWatchlisted: boolean;
  isLoggedIn: boolean;
}

export function WatchlistButton({ contentId, contentType, initialIsWatchlisted, isLoggedIn }: WatchlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isWatchlisted, setIsWatchlisted] = useState(initialIsWatchlisted);
  const router = useRouter();

  const handleToggle = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    // Optimistic UI update
    setIsWatchlisted(!isWatchlisted);

    startTransition(async () => {
      try {
        const result = await toggleWatchlist(contentId, contentType);
        setIsWatchlisted(result.isWatchlisted);
      } catch (e) {
        // Revert on error
        setIsWatchlisted(isWatchlisted);
        console.error(e);
      }
    });
  };

  return (
    <Button 
      onClick={handleToggle}
      disabled={isPending}
      size="lg" 
      variant={isWatchlisted ? "secondary" : "outline"} 
      className={`rounded-pill px-8 gap-2 font-semibold shadow-sm transition-apple ${
        isWatchlisted 
          ? "bg-primary/20 text-primary border-primary/20 hover:bg-primary/30" 
          : "bg-surface-elevated text-foreground border-white/10 hover:bg-surface-hover hover:border-white/20"
      }`}
    >
      {isWatchlisted ? (
        <BookmarkCheck className="w-4 h-4" strokeWidth={2.5} />
      ) : (
        <Bookmark className="w-4 h-4" strokeWidth={2} />
      )}
      {isWatchlisted ? "In Watchlist" : "Add to Watchlist"}
    </Button>
  );
}
