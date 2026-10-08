"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard, type MovieCardProps } from "@/components/movie/MovieCard";

interface ContentRowProps {
  title: string;
  subtitle?: string;
  items: any[];
  link?: string;
  type?: "movie" | "series";
  qualityBadge?: string;
}

export function ContentRow({
  title,
  subtitle,
  items,
  link,
  type = "movie",
  qualityBadge,
}: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const clientWidth = rowRef.current.clientWidth;
      const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 350);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative px-4 sm:px-6 md:px-10 group/row">
      {/* Header */}
      <div className="flex items-end justify-between mb-3.5 md:mb-5">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted mt-0.5 max-w-xl">{subtitle}</p>
          )}
        </div>
        {link && (
          <Link
            href={link}
            className="text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 group/link"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        )}
      </div>

      {/* Row Container with Navigation Arrows */}
      <div className="relative">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-11 h-11 -ml-3 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl transition-all duration-200 opacity-0 group-hover/row:opacity-100 hover:scale-110 active:scale-95 hidden md:flex"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto gap-3.5 sm:gap-4 md:gap-5 pb-4 pt-1 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-10 md:px-10 scroll-smooth"
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="w-[145px] sm:w-[170px] md:w-[195px] lg:w-[215px] shrink-0 snap-start"
            >
              <MovieCard
                {...item}
                type={(item.type as any) || type}
                primaryGenre={item.genres?.[0] || (type === "series" ? "TV Series" : "Movie")}
                imageUrl={(item as any).imageUrl || ""}
                qualityBadge={qualityBadge}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-11 h-11 -mr-3 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl transition-all duration-200 opacity-0 group-hover/row:opacity-100 hover:scale-110 active:scale-95 hidden md:flex"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </section>
  );
}
