"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TopTenRowProps {
  title?: string;
  subtitle?: string;
  items: any[];
}

export function TopTenRow({
  title = "Top 10 Trending Today",
  subtitle = "The most watched movies & shows on Kineos right now",
  items,
}: TopTenRowProps) {
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
    <section className="relative px-4 sm:px-6 md:px-10 py-6 sm:py-8 my-4 bg-gradient-to-b from-white/[0.03] to-transparent border-y border-white/5 group/row">
      {/* Header with Flame Icon */}
      <div className="flex items-end justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
              <Flame className="w-4 h-4 fill-primary" />
            </span>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Row Container with Navigation Arrows */}
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-11 h-11 -ml-3 rounded-full bg-black/85 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl transition-all duration-200 opacity-0 group-hover/row:opacity-100 hover:scale-110 active:scale-95 hidden md:flex"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto gap-5 sm:gap-7 pb-4 pt-2 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-10 md:px-10 scroll-smooth items-center"
        >
          {items.slice(0, 10).map((item, idx) => {
            const rank = idx + 1;
            const isSeries = item.type === "series" || Boolean((item as any).seasons);
            const href = isSeries ? `/series/${item.slug}` : `/movies/${item.slug}`;

            return (
              <div
                key={item.id}
                className="flex items-center shrink-0 snap-start group/card cursor-pointer"
              >
                {/* Netflix-style Giant Stylized Number */}
                <div className="relative select-none pointer-events-none -mr-4 sm:-mr-6 z-10">
                  <span
                    className="text-7xl sm:text-8xl md:text-9xl font-black italic tracking-tighter leading-none"
                    style={{
                      WebkitTextStroke: "2px rgba(255, 255, 255, 0.35)",
                      color: "rgba(10, 10, 14, 0.95)",
                      filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.8))",
                    }}
                  >
                    {rank}
                  </span>
                </div>

                {/* Poster Card */}
                <Link
                  href={href}
                  className="w-[125px] sm:w-[150px] md:w-[170px] aspect-[2/3] relative rounded-xl overflow-hidden bg-surface-elevated border border-white/10 shadow-xl group-hover/card:scale-105 group-hover/card:border-primary/50 transition-all duration-300 z-20"
                >
                  {/* Poster Image */}
                  {(item.imageUrl || (item as any).posterUrl) ? (
                    <Image
                      src={item.imageUrl || (item as any).posterUrl}
                      alt={item.title}
                      fill
                      sizes="180px"
                      className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-surface flex items-center justify-center p-2 text-center text-xs text-white/50">
                      {item.title}
                    </div>
                  )}

                  {/* Top Left: First Genre Only */}
                  {(item.genres?.[0] || (isSeries ? "TV Series" : "Movie")) && (
                    <div className="absolute top-2 left-2 z-30 pointer-events-none">
                      <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-black/65 text-white/90 border border-white/15 backdrop-blur-md shadow-md">
                        {item.genres?.[0] || (isSeries ? "TV Series" : "Movie")}
                      </span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent opacity-80 group-hover/card:opacity-95 transition-opacity" />

                  {/* Play Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover/card:opacity-100 transition-all duration-300 scale-75 group-hover/card:scale-100">
                    <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center backdrop-blur-md">
                      <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                    </div>
                  </div>

                  {/* Card Bottom: Title */}
                  <div className="absolute bottom-0 left-0 w-full p-2.5 z-30">
                    <h4 className="text-white font-bold text-xs sm:text-sm line-clamp-1 leading-tight group-hover/card:text-primary transition-colors">
                      {item.title}
                    </h4>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-11 h-11 -mr-3 rounded-full bg-black/85 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl transition-all duration-200 opacity-0 group-hover/row:opacity-100 hover:scale-110 active:scale-95 hidden md:flex"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </section>
  );
}
