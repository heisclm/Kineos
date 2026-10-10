"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { User, Star, ChevronLeft, ChevronRight, Film, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { slugify, cn } from "@/lib/utils";
import type { CastMemberWithStats } from "@/features/content/content.service";

interface CastGridProps {
  items: CastMemberWithStats[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize?: number;
}

export function CastGrid({
  items,
  currentPage,
  totalPages,
  totalCount,
  pageSize = 24,
}: CastGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

    if (typeof window !== "undefined") {
      const targetEl = document.getElementById("cast-catalog-content");
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 150, behavior: "smooth" });
      }
    }
  };

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
      <div className="py-20 text-center flex flex-col items-center justify-center rounded-2xl bg-surface/50 border border-white/5 p-8">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/40">
          <User className="w-8 h-8" />
        </div>
        <p className="text-xl font-bold text-foreground">No cast or crew found</p>
        <p className="text-muted-foreground mt-2 max-w-sm text-xs sm:text-sm leading-relaxed">
          No artists matched your selected rating or letter criteria. Try resetting your filters to explore the full directory.
        </p>
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-xs transition-apple shadow-lg hover:scale-105"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 relative z-0">
      {/* 1. Responsive Cast & Filmmakers Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5 animate-in fade-in duration-300">
        {items.map((member) => {
          const slug = slugify(member.name);
          const hasRating = member.highestRating !== null && member.highestRating > 0;

          return (
            <Link
              key={member.id}
              href={`/cast/${slug}`}
              className="group flex flex-col items-center p-4 rounded-2xl bg-surface border border-white/5 hover:border-primary/40 hover:bg-surface-elevated transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 shadow-md hover:shadow-2xl hover:shadow-primary/10 relative"
            >
              {/* Rating badge if available */}
              {hasRating && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-400 text-[10px] font-bold shadow-sm">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span>{member.highestRating?.toFixed(1)}</span>
                </div>
              )}

              {/* Avatar Portrait */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 border-2 border-white/10 group-hover:border-primary/60 transition-colors bg-surface-elevated shadow-inner">
                {member.imageUrl ? (
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 96px, 112px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
                    <User className="w-8 h-8 mb-0.5" />
                    <span className="text-xs font-bold">{member.name.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Name */}
              <span className="text-sm font-semibold text-foreground text-center line-clamp-1 group-hover:text-primary transition-colors">
                {member.name}
              </span>

              {/* Metadata Subtitle: Credits & Role */}
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-white/50 font-medium">
                <span className="inline-flex items-center gap-1">
                  <Film className="w-2.5 h-2.5 text-primary/70" />
                  {member.totalCredits} {member.totalCredits === 1 ? "title" : "titles"}
                </span>
                {member.primaryRole && member.primaryRole.toLowerCase() !== "actor" && (
                  <>
                    <span className="text-white/20">&bull;</span>
                    <span className="text-white/70 truncate max-w-[80px]">
                      {member.primaryRole}
                    </span>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2. Responsive Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center pt-8 pb-4 border-t border-white/5">
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
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-white/40 text-xs font-bold select-none"
                  >
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
