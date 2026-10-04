import type { Metadata } from "next";
import { getLatestMovies, getTrendingMovies, getTopRatedMovies, getFeaturedMovies, getPopularSeries } from "@/features/content/content.service";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { MovieCard } from "@/components/movie/MovieCard";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Kineos — Movies & TV Series Index",
  description: "Discover, stream, and explore movies and TV series with complete storylines, verified cast details, and high-definition streaming sources on Kineos.",
  keywords: [
    "Kineos",
    "kineos fun",
    "kineos movies",
    "watch movies online",
    "stream TV series",
    "movies index",
    "free movies online",
    "new releases",
    "top rated movies",
    "TV series episodes"
  ],
  alternates: {
    canonical: "https://www.kineos.fun",
  },
  openGraph: {
    title: "Kineos — Movies & TV Series Index",
    description: "Discover, stream, and explore movies and TV series with complete storylines, verified cast details, and high-definition streaming sources on Kineos.",
    url: "https://www.kineos.fun",
    siteName: "Kineos",
    type: "website",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Kineos",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Kineos — Movies & TV Series Index",
    description: "Discover, stream, and explore movies and TV series with complete storylines, verified cast details, and high-definition streaming sources on Kineos.",
    images: ["/icon-512.png"],
  },
};

export default async function HomePage() {
  let featuredMovies = await getFeaturedMovies(5);
  let newReleases = await getLatestMovies(10);
  let trendingMovies = await getTrendingMovies(3);
  let topRatedMovies = await getTopRatedMovies(10);
  let popularSeries = await getPopularSeries(10);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Kineos",
      "url": "https://www.kineos.fun",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.kineos.fun/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

  
  

  // Break into rows for elegant presentation
  

  const genres = ["All", "Action", "Comedy", "Drama", "Sci-Fi", "Thriller", "Horror", "Romance"];

  return (
    <div className="space-y-12 pb-24 w-full max-w-[1920px] mx-auto">
      {/* Cinematic Hero */}
      <section className="px-0 sm:px-6 md:px-10 sm:pt-6">
        <HeroCarousel movies={featuredMovies} />
      </section>

      {/* Content Rows */}
      <div className="space-y-4 md:space-y-8">
        <SpotlightRow title="Trending Now" movies={trendingMovies} />
        
        

        <StandardRow title="New Releases" movies={newReleases} link="/movies" />
        <StandardRow title="Popular TV Series" subtitle="Binge-worthy shows to stream next" movies={popularSeries} link="/series" type="series" />
        <StandardRow title="Top Rated" subtitle="Critically acclaimed masterworks" movies={topRatedMovies} link="/movies?sort=Rating" />
      </div>
    </div>
  );
}

function StandardRow({ title, subtitle, movies, link, type = "movie" }: { title: string; subtitle?: string; movies: any[]; link: string; type?: "movie" | "series" }) {
  if (!movies || movies.length === 0) return null;
  return (
    <section className="px-6 md:px-10">
      <div className="flex items-end justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
        </div>
        <Link href={link} className="text-sm font-medium text-primary hover:text-primary-hover transition-apple">
          See All
        </Link>
      </div>
      <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 pt-1 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 md:-mx-10 md:px-10">
        {movies.map((movie) => (
          <div key={movie.id} className="w-[145px] sm:w-[175px] md:w-[200px] lg:w-[220px] shrink-0 snap-start">
            <MovieCard {...movie} type={(movie.type as any) || type} primaryGenre={movie.genres?.[0] || (type === 'series' ? 'TV Series' : 'Movie')} imageUrl={(movie as any).imageUrl || ""} />
          </div>
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
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





