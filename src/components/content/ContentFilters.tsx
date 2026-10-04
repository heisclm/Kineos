"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FilterDropdown } from "@/components/ui/FilterDropdown";

export function ContentFilters({ type = "movies" }: { type?: "movies" | "series" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const genre = searchParams.get("genre") || "All Genres";
  const sort = searchParams.get("sort") || "Latest";

  const genres = [
    "All Genres",
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
  ];
    
  const sorts = ["Latest", "Popular", "A-Z", "Rating"];

  const handleUpdate = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All Genres" || value === "Latest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="flex items-center gap-3">
      <FilterDropdown 
        options={genres}
        value={genre}
        onChange={(val) => handleUpdate("genre", val)}
      />
      <FilterDropdown 
        options={sorts}
        value={sort}
        onChange={(val) => handleUpdate("sort", val)}
      />
    </div>
  );
}
