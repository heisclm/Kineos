"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import { Search, Sparkles, Loader2, Key, X, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  searchTmdbCandidatesAction,
  fetchTmdbFullDetailsAction,
} from "@/features/admin/admin.actions";
import type { TmdbCandidate, TmdbDetailedResult } from "@/lib/tmdb";

interface TmdbAutofillBarProps {
  type: "movie" | "series";
  onAutofill: (data: TmdbDetailedResult) => void;
}

export function TmdbAutofillBar({ type, onAutofill }: TmdbAutofillBarProps) {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<TmdbCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load custom API key from localStorage if saved
  useEffect(() => {
    const saved = localStorage.getItem("kineos_tmdb_api_key");
    if (saved) {
      setCustomKey(saved);
      setHasSavedKey(true);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search TMDB candidates with debouncing
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setCandidates([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchTmdbCandidatesAction(
          trimmed,
          type,
          customKey || null
        );
        setCandidates(results);
        setIsOpen(results.length > 0);
        if (results.length === 0 && trimmed.length >= 3) {
          // If 0 results, could be missing key or title not found
        }
      } catch (err: any) {
        console.error("TMDB search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, type, customKey]);

  const handleSelect = async (candidate: TmdbCandidate) => {
    setIsFetchingDetails(true);
    setIsOpen(false);
    try {
      const details = await fetchTmdbFullDetailsAction(
        candidate.id,
        type,
        customKey || null
      );
      if (!details) {
        toast.error("Could not fetch full metadata from TMDB.");
        return;
      }

      onAutofill(details);
      toast.success(`✨ Autofilled details for "${details.title}"!`);
      setQuery("");
    } catch (err: any) {
      toast.error(err.message || "Failed to autofill from TMDB.");
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = customKey.trim();
    if (cleanKey) {
      localStorage.setItem("kineos_tmdb_api_key", cleanKey);
      setHasSavedKey(true);
      toast.success("TMDB API Key saved to browser storage!");
    } else {
      localStorage.removeItem("kineos_tmdb_api_key");
      setHasSavedKey(false);
      toast.info("Cleared browser TMDB API Key (will use server .env if present)");
    }
    setApiKeyModalOpen(false);
  };

  return (
    <div className="relative w-full z-40" ref={containerRef}>
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-surface-elevated/80 to-surface-elevated/40 border border-primary/20 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/20 text-primary">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-foreground tracking-tight">
                Instant TMDB Autofill
              </h4>
              <p className="text-xs text-muted-foreground">
                Type a title or IMDb ID to fill all metadata, genres, cast, rating & artwork in 1 click.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setApiKeyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-foreground bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              title="Configure TMDB API Key"
            >
              <Key className="w-3.5 h-3.5 text-primary" />
              <span>{hasSavedKey ? "Custom API Key Active" : "API Key Settings"}</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              type === "movie"
                ? "Search movie by title or IMDb ID (e.g. Inception, Dune, tt1375666)..."
                : "Search series by title or IMDb ID (e.g. Breaking Bad, Arcane)..."
            }
            className="w-full bg-background/90 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl pl-10 pr-12 py-2.5 text-sm text-foreground placeholder:text-muted/60 transition-all outline-none"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {isSearching || isFetchingDetails ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            ) : query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCandidates([]);
                  setIsOpen(false);
                }}
                className="p-1 rounded-full text-muted hover:text-foreground hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Candidates Dropdown Menu */}
      {isOpen && candidates.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#141419] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto">
          <div className="p-2 divide-y divide-white/5">
            {candidates.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c)}
                disabled={isFetchingDetails}
                className="w-full flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-white/[0.06] text-left transition-colors group cursor-pointer"
              >
                {/* Poster Thumbnail */}
                <div className="w-11 h-16 rounded-lg bg-surface border border-white/10 overflow-hidden shrink-0 relative shadow-md">
                  {c.posterUrl ? (
                    <Image
                      src={c.posterUrl}
                      alt={c.title}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-[10px]">
                      No Art
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                      {c.title}
                    </span>
                    {c.releaseYear && (
                      <span className="text-xs text-muted font-medium shrink-0">
                        ({c.releaseYear})
                      </span>
                    )}
                  </div>

                  {c.originalTitle &&
                    c.originalTitle.toLowerCase() !== c.title.toLowerCase() && (
                      <p className="text-[11px] text-muted-foreground/60 truncate">
                        Orig: {c.originalTitle}
                      </p>
                    )}

                  {c.overview && (
                    <p className="text-xs text-muted-foreground line-clamp-1 leading-normal">
                      {c.overview}
                    </p>
                  )}
                </div>

                {/* Score badge */}
                {c.voteAverage !== null && c.voteAverage > 0 && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-md shrink-0">
                    <Star className="w-3 h-3 fill-primary" />
                    <span>{c.voteAverage.toFixed(1)}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-elevated border border-white/15 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">TMDB API Key Setup</h3>
              </div>
              <button
                type="button"
                onClick={() => setApiKeyModalOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Kineos uses TMDB to fetch trailers, ratings, genres, posters, and overviews. If you have not set{" "}
              <code className="text-primary font-mono text-[11px]">TMDB_API_KEY</code> in your{" "}
              <code className="text-primary font-mono text-[11px]">.env.local</code>, you can paste your free key here. It will be remembered securely in your browser.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Your TMDB API Key (v3 auth)
                </label>
                <input
                  type="text"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="e.g. 3a1b2c3d4e5f6g7h8i9j0k..."
                  className="w-full bg-background border border-white/15 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted/40 font-mono outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://www.themoviedb.org/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Get free key from themoviedb.org &rarr;
                </a>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setApiKeyModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5" /> Save Key
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
