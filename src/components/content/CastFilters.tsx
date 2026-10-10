"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { Star, ArrowUpDown, X, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CastFiltersProps {
  totalCount?: number;
}

const RATING_OPTIONS = [
  "All Ratings",
  "⭐ 8.0+ Top Rated",
  "⭐ 7.0+ Highly Rated",
  "⭐ 6.0+ Good Rated",
];

const SORT_OPTIONS = [
  "A - Z (Alphabetical)",
  "Z - A",
  "Highest Rating",
  "Most Credits",
];

const ALPHABET = [
  "All",
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
];

export function CastFilters({ totalCount }: CastFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentRating = searchParams.get("rating") || "All Ratings";
  const currentSort = searchParams.get("sort") || "A - Z (Alphabetical)";
  const currentLetter = searchParams.get("letter") || "All";
  const currentQuery = searchParams.get("q") || "";

  const [activeRating, setActiveRating] = useState(currentRating);
  const [activeSort, setActiveSort] = useState(currentSort);
  const [activeLetter, setActiveLetter] = useState(currentLetter);
  const [searchVal, setSearchVal] = useState(currentQuery);

  useEffect(() => {
    setActiveRating(currentRating);
  }, [currentRating]);

  useEffect(() => {
    setActiveSort(currentSort);
  }, [currentSort]);

  useEffect(() => {
    setActiveLetter(currentLetter);
  }, [currentLetter]);

  useEffect(() => {
    setSearchVal(currentQuery);
  }, [currentQuery]);

  const updateParam = (key: string, value: string) => {
    if (key === "rating") setActiveRating(value);
    if (key === "sort") setActiveSort(value);
    if (key === "letter") setActiveLetter(value);

    const params = new URLSearchParams(searchParams.toString());
    // Reset page to 1 whenever filters change
    params.delete("page");

    if (
      value === "All" ||
      value === "All Ratings" ||
      value === "A - Z (Alphabetical)" ||
      !value
    ) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const query = params.toString();
    const targetUrl = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.push(targetUrl, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", searchVal.trim());
  };

  const clearAllFilters = () => {
    setActiveRating("All Ratings");
    setActiveSort("A - Z (Alphabetical)");
    setActiveLetter("All");
    setSearchVal("");

    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters =
    activeRating !== "All Ratings" ||
    activeSort !== "A - Z (Alphabetical)" ||
    activeLetter !== "All" ||
    searchVal !== "";

  return (
    <div className="space-y-4 pb-2 relative z-30">
      {/* Top Filter Bar: Dropdowns & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Left: Quick search input */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full md:w-72 flex items-center"
        >
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onBlur={() => updateParam("q", searchVal.trim())}
            placeholder="Search actor or director..."
            className="w-full h-10 pl-10 pr-9 rounded-xl bg-surface-elevated/80 border border-white/10 text-xs font-medium text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-apple"
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => {
                setSearchVal("");
                updateParam("q", "");
              }}
              className="absolute right-3 text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Right: Rating & Sort Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Rating Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-white/50 font-medium hidden sm:inline">Rating:</span>
            <FilterDropdown
              options={RATING_OPTIONS}
              value={activeRating}
              onChange={(val) => updateParam("rating", val)}
              className="w-44 sm:w-48"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-white/50 font-medium hidden sm:inline">Sort:</span>
            <FilterDropdown
              options={SORT_OPTIONS}
              value={activeSort}
              onChange={(val) => updateParam("sort", val)}
              className="w-44 sm:w-48"
            />
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-apple h-10"
            >
              <X className="w-3.5 h-3.5 text-primary" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Responsive Alphabetical Ribbon (A - Z Quick Jump) */}
      <div className="w-full overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-max">
          {ALPHABET.map((letter) => {
            const isSelected = activeLetter === letter;
            return (
              <button
                key={letter}
                type="button"
                onClick={() => updateParam("letter", letter)}
                className={cn(
                  "px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold transition-apple border",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25 scale-105"
                    : "bg-surface-elevated/60 text-white/60 hover:text-white hover:bg-surface-elevated border-white/5 hover:border-white/15"
                )}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Status Badge Strip */}
      <div className="flex items-center justify-between text-xs text-white/50 pt-1">
        <div className="flex items-center gap-2">
          {totalCount !== undefined && (
            <span>
              <strong className="text-white font-semibold">{totalCount}</strong>{" "}
              {totalCount === 1 ? "artist" : "artists"} found
            </span>
          )}
          {hasActiveFilters && (
            <span className="text-primary font-medium">&bull; Filters active</span>
          )}
        </div>
      </div>
    </div>
  );
}
