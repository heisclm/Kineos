import { fetchCatalogItems } from "@/features/content/catalog.actions";
import { CatalogGrid } from "@/components/content/CatalogGrid";
import { ContentFilters } from "@/components/content/ContentFilters";

export const metadata = {
  title: "TV Series",
  description: "Browse premium TV series and episodic content.",
};

export default async function SeriesIndexPage({
  searchParams,
}: {
  searchParams: { genre?: string; sort?: string };
}) {
  const genre = searchParams.genre;
  const sort = searchParams.sort;

  let series = await fetchCatalogItems("series", 1, 30, genre, sort);

  if (!series || series.length === 0) {
      }

  return (
    <div className="w-full relative pb-24 space-y-12 max-w-[1920px] mx-auto pt-8 px-6 md:px-10">
      
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">TV Series</h1>
          <p className="text-lg text-muted max-w-xl">
            Binge-worthy shows, limited series, and episodic entertainment.
          </p>
        </div>
        
        <ContentFilters type="series" />
      </div>

      <div className="w-full py-2 flex justify-center">
        
      </div>

      <CatalogGrid
        key={`${genre || 'all'}-${sort || 'latest'}`}
        initialItems={series} 
        type="series" 
        genre={genre}
        sort={sort}
      />
    </div>
  );
}
