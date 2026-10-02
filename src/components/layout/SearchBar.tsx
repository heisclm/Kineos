/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { Search, Loader2, PlayCircle, Tv, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { searchContent, type SearchResult } from "@/features/search/search.actions";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface SearchBarProps {
  className?: string;
  isMobile?: boolean;
  onSelect?: () => void;
}

export function SearchBar({ className, isMobile = false, onSelect }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch results when debounced query changes
  useEffect(() => {
    async function fetchResults() {
      if (debouncedQuery.trim().length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const data = await searchContent(debouncedQuery);
        setResults(data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    }

    fetchResults();
  }, [debouncedQuery]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
      onSelect?.();
    }
  };

  const handleResultClick = () => {
    setQuery("");
    setIsFocused(false);
    onSelect?.();
  };

  const showDropdown = isFocused && query.trim().length >= 2;

  return (
    <div ref={containerRef} className={cn("relative group w-full", className)}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <Search 
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-apple",
            isFocused ? "text-primary" : "",
            isMobile ? "w-5 h-5" : "w-4 h-4"
          )} 
          strokeWidth={2} 
        />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={isMobile ? "Search movies, series, actors..." : "Search..."}
          className={cn(
            "w-full border border-white/10 text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-apple",
            isMobile 
              ? "bg-surface-elevated rounded-xl py-4 pl-12 pr-12 text-lg focus:ring-2" 
              : "bg-background rounded-lg py-2.5 pl-11 pr-10 text-sm shadow-sm"
          )}
        />

        {query && (
          <button 
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsFocused(false); // maybe keep focused?
            }}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors",
              isMobile ? "right-4" : "right-3"
            )}
          >
            <X className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
          </button>
        )}
      </form>

      {/* Results Dropdown */}
      {showDropdown && (
        <div 
          className={cn(
            "absolute z-50 w-full overflow-hidden flex flex-col bg-surface-elevated/95 backdrop-blur-xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200",
            isMobile ? "top-full mt-2 rounded-2xl" : "top-full mt-1 rounded-xl"
          )}
        >
          {isSearching ? (
            <div className="flex items-center justify-center py-8 text-muted">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col py-2">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={`/${result.type === 'movie' ? 'movies' : 'series'}/${result.slug}`}
                  onClick={handleResultClick}
                  className={cn(
                    "flex items-center gap-4 px-4 hover:bg-white/5 transition-colors group",
                    isMobile ? "py-4" : "py-3"
                  )}
                >
                  <div className={cn(
                    "shrink-0 bg-background border border-white/5 flex items-center justify-center overflow-hidden",
                    isMobile ? "w-12 h-16 rounded-md" : "w-10 h-14 rounded"
                  )}>
                    {result.imageUrl ? (
                      <img src={result.imageUrl} alt={result.title} className="w-full h-full object-cover" />
                    ) : result.type === 'movie' ? (
                      <PlayCircle className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
                    ) : (
                      <Tv className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn("font-semibold text-foreground truncate group-hover:text-primary transition-colors", isMobile ? "text-base" : "text-sm")}>
                      {result.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
                        {result.type}
                      </span>
                      {result.releaseDate && (
                        <span className={cn("text-muted truncate", isMobile ? "text-xs" : "text-[11px]")}>
                          {result.releaseDate}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={handleResultClick}
                className={cn(
                  "mt-2 text-center text-primary hover:text-primary/80 font-medium border-t border-white/5 bg-primary/5 hover:bg-primary/10 transition-colors",
                  isMobile ? "py-4 text-sm" : "py-2.5 text-xs"
                )}
              >
                View all results for &quot;{query}&quot;
              </Link>
            </div>
          ) : (
            <div className="py-8 text-center px-4">
              <p className={cn("text-foreground font-medium", isMobile ? "text-base" : "text-sm")}>No results found</p>
              <p className={cn("text-muted mt-1", isMobile ? "text-sm" : "text-xs")}>Try searching for a different title, actor, or genre.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
