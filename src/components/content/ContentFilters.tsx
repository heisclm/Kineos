"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentFiltersProps {
  type?: "movies" | "series";
  totalCount?: number;
}

export function ContentFilters({ type = "movies", totalCount }: ContentFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentGenre = searchParams.get("genre") || "All";
  const currentSort = searchParams.get("sort") || "Latest";

  const genrePills = [
    "All",
    "Action",
    "Adventure",
    "Comedy",
    "Crime",
    "Drama",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
  ];

  const sorts = ["Latest", "Popular", "Rating", "A-Z"];

  const handleUpdate = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" || value === "All Genres" || value === "Latest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters = currentGenre !== "All" || currentSort !== "Latest";

  return (
    <div className="space-y-4 w-full">
      {/* Top Filter Bar: Horizontal Genre Chips + Sort Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        {/* Genre Pill Chips (Netflix / Prime Video style) */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1 -mx-2 px-2 sm:mx-0 sm:px-0">
          {genrePills.map((genre) => {
            const isActive =
              (genre === "All" && (!searchParams.get("genre") || currentGenre === "All")) ||
              currentGenre.toLowerCase() === genre.toLowerCase();

            return (
              <button
                key={genre}
                onClick={() => handleUpdate("genre", genre)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25 scale-105"
                    : "bg-surface-elevated/80 hover:bg-surface-elevated text-white/80 hover:text-white border-white/10 hover:border-white/20"
                )}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Right side: Sort Controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-muted hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white/50 hidden md:inline">Sort:</span>
            <FilterDropdown
              options={sorts}
              value={currentSort}
              onChange={(val) => handleUpdate("sort", val)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
