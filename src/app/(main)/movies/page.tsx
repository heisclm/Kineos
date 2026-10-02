import { fetchCatalogItems } from "@/features/content/catalog.actions";
import { CatalogGrid } from "@/components/content/CatalogGrid";
import { MOCK_MOVIES } from "@/lib/mock-data";
import { ContentFilters } from "@/components/content/ContentFilters";
import { AdSlot } from "@/components/ui/AdSlot";

export const metadata = {
  title: "Movies | Kineos",
  description: "Browse the latest and greatest movies.",
};

export default async function MoviesIndexPage({
  searchParams,
}: {
  searchParams: { genre?: string; sort?: string };
}) {
  const genre = searchParams.genre;
  const sort = searchParams.sort;

  let movies = await fetchCatalogItems("movie", 1, 30, genre, sort);

  if (!movies || movies.length === 0) {
    // Fallback if DB is empty, just for testing visually
    if (!genre) movies = MOCK_MOVIES as any;
  }

  return (
    <div className="w-full relative pb-24 space-y-12 max-w-[1920px] mx-auto pt-8 px-6 md:px-10">
      
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">Movies</h1>
          <p className="text-lg text-muted max-w-xl">
            Explore our curated collection of critically acclaimed films, blockbuster hits, and hidden gems.
          </p>
        </div>
        
        <ContentFilters type="movies" />
      </div>

      <div className="w-full py-2 flex justify-center">
        <AdSlot format="leaderboard" slotId="movies_top" />
      </div>

      <CatalogGrid 
        initialItems={movies} 
        type="movie" 
        genre={genre}
        sort={sort}
      />
    </div>
  );
}
