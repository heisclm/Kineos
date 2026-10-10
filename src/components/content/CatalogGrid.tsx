"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MovieCard } from "@/components/movie/MovieCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CatalogGridProps {
  initialItems: any[];
  type: "movie" | "series";
  genre?: string;
  sort?: string;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalCount?: number;
}

export function CatalogGrid({
  initialItems,
  type,
  genre,
  sort,
  currentPage = 1,
  totalPages = 1,
  pageSize = 12,
  totalCount = 0,
}: CatalogGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;

    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }

    const query = params.toString();
    const targetUrl = query ? `${pathname}?${query}` : pathname;

    router.push(targetUrl, { scroll: false });

    // Smoothly scroll back to the top of catalog grid results
    if (typeof window !== "undefined") {
      const targetEl = document.getElementById("catalog-content");
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 350, behavior: "smooth" });
      }
    }
  };

  // Generate page numbers array with ellipsis for clean navigation
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);
    return pages;
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-foreground">No {type === "movie" ? "movies" : "series"} found.</p>
        <p className="text-muted mt-2 max-w-sm text-sm">
          There are currently no titles available in this category. Try selecting another genre or browse all titles.
        </p>
        <Link href={type === "movie" ? "/movies" : "/series"} className="mt-6">
          <Button
            variant="outline"
            className="rounded-full px-6 border-white/10 hover:bg-white/10 text-sm font-semibold transition-apple"
          >
            Browse All {type === "movie" ? "Movies" : "Series"}
          </Button>
        </Link>
      </div>
    );
  }

  const startCount = (currentPage - 1) * pageSize + 1;
  const endCount = Math.min(currentPage * pageSize, totalCount || items.length);

  return (
    <div className="space-y-10 relative z-0">
      {/* 1. Responsive Netflix-Style Movie Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6 animate-in fade-in duration-300">
        {items.map((item) => (
          <MovieCard
            key={item.id}
            {...item}
            type={type}
            primaryGenre={item.genres?.[0] || (type === "movie" ? "Movie" : "Series")}
            imageUrl={item.imageUrl || ""}
          />
        ))}
      </div>

      {/* 2. Premium Streaming Platform Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-4 border-t border-white/5">
          {/* Summary Text */}
          <div className="text-xs font-medium text-white/50 text-center sm:text-left">
            Showing <span className="font-semibold text-white/80">{startCount}–{endCount}</span> of{" "}
            <span className="font-semibold text-white/80">{totalCount}</span> titles
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="rounded-full px-3 sm:px-4 h-9 border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold gap-1 text-white/90 transition-apple"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {/* Desktop / Tablet Numbered Pills */}
            <div className="hidden sm:flex items-center gap-1.5">
              {getPageNumbers().map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-white/40 text-xs font-bold select-none">
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${p}`}
                    type="button"
                    onClick={() => handlePageChange(p as number)}
                    className={cn(
                      "w-9 h-9 rounded-full text-xs font-bold transition-all duration-200 border cursor-pointer flex items-center justify-center",
                      currentPage === p
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30 scale-105"
                        : "bg-surface-elevated/80 hover:bg-surface-elevated text-white/70 hover:text-white border-white/10 hover:border-white/20"
                    )}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            {/* Mobile Compact Page Indicator */}
            <div className="flex sm:hidden items-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/80">
              Page {currentPage} of {totalPages}
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="rounded-full px-3 sm:px-4 h-9 border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold gap-1 text-white/90 transition-apple"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
