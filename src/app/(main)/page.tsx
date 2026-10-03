import { getLatestMovies, getTrendingMovies, getTopRatedMovies } from "@/features/content/content.service";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { MovieCard } from "@/components/movie/MovieCard";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default async function HomePage() {
  let latestMovies = await getLatestMovies(18);
  let trendingMovies = await getTrendingMovies(3);
  let topRatedMovies = await getTopRatedMovies(5);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Kineos",
      "url": "https://kineos.fun",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://kineos.fun/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

  
  

  // Break into rows for elegant presentation
  const newReleases = latestMovies.slice(0, 5);

  const genres = ["All", "Action", "Comedy", "Drama", "Sci-Fi", "Thriller", "Horror", "Romance"];

  return (
    <div className="space-y-12 pb-24 w-full max-w-[1920px] mx-auto">
      {/* Cinematic Hero */}
      <section className="px-0 sm:px-6 md:px-10 sm:pt-6">
        <HeroCarousel movies={latestMovies.slice(0, 5)} />
      </section>

      {/* Content Rows */}
      <div className="space-y-4 md:space-y-8">
        <SpotlightRow title="Trending Now" movies={trendingMovies} />
        
        

        <StandardRow title="New Releases" movies={newReleases} />
        <StandardRow title="Top Rated" subtitle="Critically acclaimed masterworks" movies={topRatedMovies} />
      </div>
    </div>
  );
}

function StandardRow({ title, subtitle, movies }: { title: string; subtitle?: string; movies: any[] }) {
  if (!movies || movies.length === 0) return null;
  return (
    <section className="px-6 md:px-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
        </div>
        <button className="text-sm font-medium text-primary hover:text-primary-hover transition-apple">
          See All
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} {...movie} primaryGenre={movie.genres?.[0] || 'Movie'} imageUrl={(movie as any).imageUrl || ""} />
        ))}
      </div>
    </section>
  );
}

function SpotlightRow({ title, movies }: { title: string; movies: any[] }) {
  if (!movies || movies.length === 0) return null;
  return (
    <section className="px-6 md:px-10 py-12 my-8 bg-surface-elevated/30 border-y border-white/5 relative overflow-hidden">
      {/* Subtle background element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="mb-8 max-w-2xl relative z-10">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-muted text-lg mt-2">Discover the most talked-about films shaping the cultural conversation this week.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {movies.slice(0, 3).map((movie, idx) => (
          <Link key={movie.id} href={`/movies/${movie.slug}`} className="flex gap-6 items-center group cursor-pointer p-4 rounded-xl hover:bg-surface border border-transparent hover:border-white/5 transition-apple">
            <h1 className="text-6xl md:text-8xl font-black text-white/5 group-hover:text-white/10 transition-apple italic w-12 text-center shrink-0">
              {idx + 1}
            </h1>
            <div className="aspect-[2/3] w-24 shrink-0 rounded-md bg-surface-overlay overflow-hidden relative shadow-lg group-hover:scale-105 transition-apple">
              <div className="absolute inset-0 bg-gradient-to-tr from-surface-elevated to-transparent z-10" />{(movie as any).imageUrl && <Image src={(movie as any).imageUrl} alt={movie.title} fill className="object-cover" />}</div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-primary mb-1">
                {movie.genres?.[0] || 'Trending'}
              </span>
              <h4 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-apple mb-2 line-clamp-2">
                {movie.title}
              </h4>
              <p className="text-xs text-muted line-clamp-2">{(movie as any).shortTeaser || movie.description}</p>
              </div>
            </Link>
        ))}
      </div>
    </section>
  );
}





