import fs from 'fs';

const targetMovie = 'src/app/(main)/movies/[slug]/page.tsx';
let contentMovie = fs.readFileSync(targetMovie, 'utf8');

const replacement = `      {/* Movie Hero/Backdrop Layer */}
      <div className="w-full relative">
        <div className="w-full h-[55vh] md:h-[65vh] min-h-[450px] md:min-h-[550px] relative flex flex-col justify-end">
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
           
           <div className="relative z-20 w-full max-w-[1920px] mx-auto px-6 md:px-10 pb-6 md:pb-12 flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-end">
             
             {(movie as any).imageUrl && (
               <div className="w-40 md:w-64 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/10 relative z-30 transform md:translate-y-16">
                 <Image src={(movie as any).imageUrl} alt={movie.title} fill className="object-cover" />
               </div>
             )}
             
             <div className="flex-1 text-center md:text-left mt-2 md:mt-0 w-full">
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-4 leading-[1.1] tracking-tight text-balance drop-shadow-2xl">
                  {movie.title}
                </h1>
                
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-6 text-sm font-semibold text-white/90 drop-shadow-md">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" strokeWidth={2} /> {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA'}</span>
                  <span className="text-white/40">&bull;</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" strokeWidth={2} /> {formatDuration(movie.runtime)}</span>
                  <span className="text-white/40">&bull;</span>
                  <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-primary text-primary" strokeWidth={2} /> {movie.rating || 'NR'}</span>
                </div>
                
                <p className="text-base md:text-lg text-white/80 leading-relaxed mb-6 md:mb-8 max-w-3xl drop-shadow-md md:line-clamp-3">
                  {(movie as any).shortTeaser || movie.description}
                </p>
 
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                   <Button size="lg" className="rounded-pill px-8 gap-2 font-semibold bg-primary text-primary-foreground hover:scale-105 transition-apple shadow-lg border border-primary/20">
                      <Play className="w-4 h-4" fill="currentColor" /> Watch Trailer
                   </Button>
                </div>
             </div>
           </div>
        </div>
      </div>`;

contentMovie = contentMovie.replace(/\{\/\* Movie Hero\/Backdrop Layer \*\/\}[\s\S]*?<\/div>\s*\{\/\* Top Leaderboard Ad \*\/\}/, replacement + '\n\n      {/* Top Leaderboard Ad */}');

fs.writeFileSync(targetMovie, contentMovie);
console.log("Updated movies detail page");
