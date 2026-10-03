import { searchMovies } from "@/features/content/content.service";
import { MovieCard } from "@/components/movie/MovieCard";
import { Search } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  
  const results = q ? await searchMovies(q) : [];

  return (
    <div className="space-y-12 pb-24 pt-8 px-6 md:px-10 max-w-[1920px] mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {q ? `Search Results for "${q}"` : "Search Kineos"}
        </h1>
        <p className="text-muted">
          {results.length} result{results.length !== 1 && 's'} found
        </p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {results.map((movie) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              slug={movie.slug}
              description={movie.description || ""}
              primaryGenre={"Matched"} // Ideally fetched, mocked for search preview
              imageUrl={(movie as any).imageUrl || ""}
              shortTeaser={(movie as any).shortTeaser}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 rounded-xl border border-dashed border-white/5 bg-surface flex flex-col items-center justify-center text-center mt-12 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center mb-6 border border-white/5">
            <Search className="w-8 h-8 text-muted" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-medium text-foreground mb-3">No matching content found</p>
          <p className="text-sm text-muted max-w-md">
            We couldn&apos;t find anything for &quot;{q}&quot;. Try adjusting your search terms, searching for an actor, or browsing our curated catalogs.
          </p>
        </div>
      )}
    </div>
  );
}

