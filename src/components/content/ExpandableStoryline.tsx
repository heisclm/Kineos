"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableStorylineProps {
  text: string;
  maxLines?: number;
  className?: string;
}

export function ExpandableStoryline({
  text,
  maxLines = 4,
  className,
}: ExpandableStorylineProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  // If text is short (roughly under 280 characters and single paragraph), show directly
  const isLong = text.length > 280 || text.includes("\n");

  return (
    <div className={cn("space-y-3 relative", className)}>
      <div className="relative">
        <p
          className={cn(
            "text-[15px] sm:text-base md:text-lg text-white/85 leading-relaxed md:leading-[1.8] font-normal text-left text-pretty whitespace-pre-line transition-all duration-300",
            !isExpanded && isLong && "line-clamp-4"
          )}
        >
          {text}
        </p>

        {/* Subtle gradient fade-out when collapsed */}
        {!isExpanded && isLong && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}
      </div>

      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors pt-1 cursor-pointer focus:outline-none focus-visible:underline select-none"
        >
          {isExpanded ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Read More</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
