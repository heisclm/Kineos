import fs from 'fs';

function replaceMovieHero() {
  const target = 'src/app/(main)/movies/[slug]/page.tsx';
  let content = fs.readFileSync(target, 'utf8');

  const replacement = `      {/* Movie Hero/Backdrop Layer */}
      <div className="w-full relative bg-background">
        <div className="w-full h-[65vh] md:h-[70vh] min-h-[550px] md:min-h-[600px] relative flex flex-col justify-end">
           <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
           <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10 w-2/3" />
           
           {(movie as any).backdropUrl || (movie as any).imageUrl ? (
             <Image 
               src={(movie as any).backdropUrl || (movie as any).imageUrl}
               alt={movie.title}
               fill
               className="object-cover object-top z-0 opacity-40 md:opacity-50 mix-blend-screen"
               priority
             />
           ) : (
             <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 via-transparent to-transparent z-0 opacity-60" />
           )}
           
           <div className="relative z-20 w-full max-w-[1920px] mx-auto px-4 md:px-10 pb-8 md:pb-12 flex gap-6 md:gap-10 items-end">
             
             {(movie as any).imageUrl && (
               <div className="hidden md:block w-40 md:w-64 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative z-30 transform translate-y-12 md:translate-y-24">
                 <Image src={(movie as any).imageUrl} alt={movie.title} fill className="object-cover" />
               </div>
             )}
             
             <div className="flex-1 text-left mt-2 md:mt-0 w-full">
                {/* Mobile Poster (Shown next to title on mobile for premium look) */}
                <div className="md:hidden flex gap-4 items-end mb-4">
                  {(movie as any).imageUrl && (
                    <div className="w-28 aspect-[2/3] shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/10 relative z-30">
                      <Image src={(movie as any).imageUrl} alt={movie.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="pb-1">
                    <h1 className="text-3xl font-bold text-foreground leading-[1.1] tracking-tight text-balance drop-shadow-2xl mb-2">
                      {movie.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/90 drop-shadow-md">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" strokeWidth={2.5} /> {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA'}</span>
                      <span className="text-white/40">&bull;</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" strokeWidth={2.5} /> {formatDuration(movie.runtime)}</span>
                    </div>
                  </div>
                </div>

                <h1 className="hidden md:block text-5xl lg:text-7xl font-bold text-foreground mb-4 leading-[1.1] tracking-tight text-balance drop-shadow-2xl">
                  {movie.title}
                </h1>
                
                <div className="hidden md:flex flex-wrap items-center gap-3 mb-6 text-sm font-semibold text-white/90 drop-shadow-md">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" strokeWidth={2.5} /> {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA'}</span>
                  <span className="text-white/40">&bull;</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" strokeWidth={2.5} /> {formatDuration(movie.runtime)}</span>
                  <span className="text-white/40">&bull;</span>
                  <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-primary text-primary" strokeWidth={2.5} /> {movie.rating || 'NR'}</span>
                </div>
                
                <p className="text-sm md:text-lg text-white/90 leading-relaxed mb-6 md:mb-8 max-w-3xl drop-shadow-lg font-medium">
                  {(movie as any).shortTeaser || movie.description}
                </p>
 
                <div className="flex flex-wrap items-center gap-4">
                   <Button size="lg" className="rounded-pill px-8 gap-2 font-semibold bg-primary text-primary-foreground hover:scale-105 transition-apple shadow-lg border border-primary/20">
                      <Play className="w-4 h-4" fill="currentColor" /> Watch Trailer
                   </Button>
                </div>
             </div>
           </div>
        </div>
      </div>
      
      {/* Spacer for desktop poster overlap */}
      <div className="hidden md:block h-16 md:h-24 w-full bg-background" />`;

  content = content.replace(/\{\/\* Movie Hero\/Backdrop Layer \*\/\}[\s\S]*?<\/div>\s*\{\/\* Top Leaderboard Ad \*\/\}/, replacement + '\n\n      {/* Top Leaderboard Ad */}');
  fs.writeFileSync(target, content);
  console.log("Updated movies detail page");
}

function replaceSeriesHero() {
  const target = 'src/app/(main)/series/[slug]/page.tsx';
  let content = fs.readFileSync(target, 'utf8');

  const replacement = `      {/* Series Hero/Backdrop Layer */}
      <div className="w-full relative bg-background">
        <div className="w-full h-[65vh] md:h-[70vh] min-h-[550px] md:min-h-[600px] relative flex flex-col justify-end">
           <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
           <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10 w-2/3" />
           
           {(series as any).backdropUrl || (series as any).imageUrl ? (
             <Image 
               src={(series as any).backdropUrl || (series as any).imageUrl}
               alt={series.title}
               fill
               className="object-cover object-top z-0 opacity-40 md:opacity-50 mix-blend-screen"
               priority
             />
           ) : (
             <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 via-transparent to-transparent z-0 opacity-60" />
           )}
           
           <div className="relative z-20 w-full max-w-[1920px] mx-auto px-4 md:px-10 pb-8 md:pb-12 flex gap-6 md:gap-10 items-end">
             
             {(series as any).imageUrl && (
               <div className="hidden md:block w-40 md:w-64 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative z-30 transform translate-y-12 md:translate-y-24">
                 <Image src={(series as any).imageUrl} alt={series.title} fill className="object-cover" />
               </div>
             )}
             
             <div className="flex-1 text-left mt-2 md:mt-0 w-full">
                {/* Mobile Poster (Shown next to title on mobile for premium look) */}
                <div className="md:hidden flex gap-4 items-end mb-4">
                  {(series as any).imageUrl && (
                    <div className="w-28 aspect-[2/3] shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/10 relative z-30">
                      <Image src={(series as any).imageUrl} alt={series.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="pb-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="glass" className="px-2 py-0.5 text-[10px] font-semibold tracking-wider bg-primary/20 text-primary border-primary/20">
                        SERIES
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground leading-[1.1] tracking-tight text-balance drop-shadow-2xl mb-2">
                      {series.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/90 drop-shadow-md">
                      {series.releaseDate && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" strokeWidth={2.5} /> {new Date(series.releaseDate).getFullYear()}</span>}
                      <span className="text-white/40">&bull;</span>
                      <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" strokeWidth={2.5} /> {seasonsWithEpisodes.length} S</span>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="glass" className="px-3 py-1 text-xs font-semibold tracking-wider bg-primary/20 text-primary border-primary/20">
                    SERIES
                  </Badge>
                  {series.genres?.map((g: string | null) => (
                    <Badge key={g} variant="glass" className="px-3 py-1 text-xs font-medium bg-white/10 border-white/20 text-white/90">
                      {g}
                    </Badge>
                  ))}
                </div>

                <h1 className="hidden md:block text-5xl lg:text-7xl font-bold text-foreground mb-4 leading-[1.1] tracking-tight text-balance drop-shadow-2xl">
                  {series.title}
                </h1>
                
                <div className="hidden md:flex flex-wrap items-center gap-3 mb-6 text-sm font-semibold text-white/90 drop-shadow-md">
                  {series.releaseDate && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" strokeWidth={2.5} /> {new Date(series.releaseDate).getFullYear()}</span>}
                  <span className="text-white/40">&bull;</span>
                  <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" strokeWidth={2.5} /> {seasonsWithEpisodes.length} Seasons</span>
                  <span className="text-white/40">&bull;</span>
                  <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-primary text-primary" strokeWidth={2.5} /> {series.rating || 'NR'}</span>
                </div>
                
                <p className="text-sm md:text-lg text-white/90 leading-relaxed mb-6 md:mb-8 max-w-3xl drop-shadow-lg font-medium">
                  {(series as any).shortTeaser || series.description}
                </p>
 
                <div className="flex flex-wrap items-center gap-4">
                   <Button size="lg" className="rounded-pill px-8 gap-2 font-semibold bg-primary text-primary-foreground hover:scale-105 transition-apple shadow-lg border border-primary/20">
                      <Play className="w-4 h-4" fill="currentColor" /> Watch Trailer
                   </Button>
                </div>
             </div>
           </div>
        </div>
      </div>
      
      {/* Spacer for desktop poster overlap */}
      <div className="hidden md:block h-16 md:h-24 w-full bg-background" />`;

  content = content.replace(/\{\/\* Series Hero\/Backdrop Layer \*\/\}[\s\S]*?<\/div>\s*<div className="w-full flex justify-center py-4 px-6 md:px-10 max-w-\[1920px\] mx-auto relative z-20">/, replacement + '\n\n      <div className="w-full flex justify-center py-4 px-6 md:px-10 max-w-[1920px] mx-auto relative z-20">');
  fs.writeFileSync(target, content);
  console.log("Updated series detail page");
}

replaceMovieHero();
replaceSeriesHero();
