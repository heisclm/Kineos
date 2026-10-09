"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterDropdownProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function FilterDropdown({ options, value, onChange, className }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", isOpen ? "z-[100]" : "z-30", className)} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 bg-surface-elevated hover:bg-surface-hover border border-white/10 rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition-apple shadow-sm w-36"
      >
        <span className="truncate">{value}</span>
        <ChevronDown className={cn("w-4 h-4 text-muted transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-[#141419] bg-opacity-100 border border-white/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-150">
          <div className="py-1 max-h-60 overflow-y-auto scrollbar-hide">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-apple",
                  value === option 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                {option}
                {value === option && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
