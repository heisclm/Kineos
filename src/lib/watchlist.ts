"use client";

import { useState, useEffect, useCallback } from "react";

export interface WatchlistItem {
  id: string;
  title: string;
  slug: string;
  type: "movie" | "series";
  imageUrl?: string | null;
  primaryGenre?: string | null;
  releaseDate?: string | Date | null;
  rating?: string | null;
  ratingScore?: number | null;
  runtime?: number | null;
  seasonsCount?: number | null;
  shortTeaser?: string | null;
  addedAt?: number;
}

const STORAGE_KEY = "kineos_user_watchlist";
const EVENT_NAME = "kineos_watchlist_updated";

function getStoredWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to read watchlist from storage:", e);
    return [];
  }
}

function setStoredWatchlist(items: WatchlistItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
  } catch (e) {
    console.error("Failed to save watchlist to storage:", e);
  }
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(getStoredWatchlist());
    setMounted(true);

    const handleUpdate = () => {
      setItems(getStoredWatchlist());
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const isInWatchlist = useCallback(
    (id: string) => {
      return items.some((i) => i.id === id);
    },
    [items]
  );

  const addToWatchlist = useCallback((item: WatchlistItem) => {
    const current = getStoredWatchlist();
    if (current.some((i) => i.id === item.id)) return;
    const updated = [{ ...item, addedAt: Date.now() }, ...current];
    setStoredWatchlist(updated);
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    const current = getStoredWatchlist();
    const updated = current.filter((i) => i.id !== id);
    setStoredWatchlist(updated);
  }, []);

  const toggleWatchlist = useCallback(
    (item: WatchlistItem) => {
      const exists = items.some((i) => i.id === item.id);
      if (exists) {
        removeFromWatchlist(item.id);
        return false;
      } else {
        addToWatchlist(item);
        return true;
      }
    },
    [items, addToWatchlist, removeFromWatchlist]
  );

  return {
    items,
    count: mounted ? items.length : 0,
    isLoaded: mounted,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
  };
}
