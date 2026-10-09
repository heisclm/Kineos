"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Filter, RotateCcw } from "lucide-react";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { Button } from "@/components/ui/button";

interface AdminCatalogToolbarProps {
  placeholder?: string;
  totalFiltered?: number;
}

const STATUS_LABELS: Record<string, string> = {
  all: "All Statuses",
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

const STATUS_OPTIONS = ["All Statuses", "Published", "Draft", "Archived"];

export function AdminCatalogToolbar({
  placeholder = "Search by title or slug...",
  totalFiltered,
}: AdminCatalogToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") || "";
  const currentStatus = searchParams.get("status") || "all";

  const [searchTerm, setSearchTerm] = useState(currentQ);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSearchTerm(currentQ);
  }, [currentQ]);

  const updateFilters = (newQ: string, newStatus: string) => {
    const params = new URLSearchParams();
    if (newQ.trim()) {
      params.set("q", newQ.trim());
    }
    if (newStatus && newStatus !== "all") {
      params.set("status", newStatus);
    }
    // Always reset page to 1 when filters change
    const queryString = params.toString();
    startTransition(() => {
      router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(searchTerm, currentStatus);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    updateFilters("", currentStatus);
  };

  const handleStatusChange = (selectedLabel: string) => {
    const key =
      Object.keys(STATUS_LABELS).find(
        (k) => STATUS_LABELS[k].toLowerCase() === selectedLabel.toLowerCase()
      ) || "all";
    updateFilters(searchTerm, key);
  };

  const handleResetAll = () => {
    setSearchTerm("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = Boolean(currentQ || (currentStatus && currentStatus !== "all"));
  const activeStatusLabel = STATUS_LABELS[currentStatus] || "All Statuses";

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-white/[0.02] border-b border-white/10">
      {/* Search Input Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex-1 max-w-md flex items-center"
      >
        <Search className="w-4 h-4 absolute left-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-surface-elevated/80 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/40 rounded-xl pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all outline-none"
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </form>

      {/* Right Filters & Reset */}
      <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <FilterDropdown
            options={STATUS_OPTIONS}
            value={activeStatusLabel}
            onChange={handleStatusChange}
            className="w-40"
          />
        </div>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetAll}
            className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-white/10 gap-1.5 rounded-lg border border-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
