import fs from 'fs';

function updateHero(file, isSeries) {
  let content = fs.readFileSync(file, 'utf8');

  // Need to extract the portion between `{/* Movie Hero/Backdrop Layer */}` or `{/* Series Hero/Backdrop Layer */}` and `{/* Top Leaderboard Ad */}`

  const heroStartRegex = /{\/\* (?:Movie|Series) Hero\/Backdrop Layer \*\/}/;
  const adStartRegex = /{\/\* Top Leaderboard Ad \*\/}/;

  const match1 = content.match(heroStartRegex);
  const match2 = content.match(adStartRegex);

  if (!match1 || !match2) {
    console.error("Could not find boundaries in", file);
    return;
  }

  const before = content.substring(0, match1.index);
  const after = content.substring(match2.index);
  
  const varName = isSeries ? 'series' : 'movie';
  const label = isSeries ? 'Series' : 'Movie';

  const newHero = \`{/* \${label} Hero/Backdrop Layer */}
      <div className="w-full relative">
        <div className="w-full h-[50vh] md:h-[60vh] min-h-[400px] md:min-h-[500px] relative">
           <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10 h-full" />
           <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10 w-2/3" />
           
           {(\${varName} as any).backdropUrl || (\${varName} as any).imageUrl ? (
             <Image 
               src={(\${varName} as any).backdropUrl || (\${varName} as any).imageUrl}
               alt={\${varName}.title}
               fill
               className="object-cover object-top z-0 opacity-70 md:opacity-50"
               priority
             />
           ) : (
             <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 via-transparent to-transparent z-0 opacity-60" />
           )}
        </div>
        
        <div className="relative z-20 max-w-[1920px] mx-auto px-6 md:px-10 -mt-32 md:-mt-48 pb-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-end">
            
            {(\${varName} as any).imageUrl && (
              <div className="w-40 md:w-64 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/10 relative z-30">
                <Image src={(\${varName} as any).imageUrl} alt={\${varName}.title} fill className="object-cover" />
              </div>
            )}
            
            <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-[1.1] tracking-tight text-balance drop-shadow-lg">
                 {\${varName}.title}
               </h1>
               
               <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-6 text-sm font-medium text-muted drop-shadow-md">
                 <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" strokeWidth={2} /> {\${varName}.releaseDate ? new Date(\${varName}.releaseDate).getFullYear() : 'TBA'}</span>
                 <span className="text-muted-foreground/30">&bull;</span>
                 \${!isSeries ? \`<span className="flex items-center gap-1.5"><Clock className="w-4 h-4" strokeWidth={2} /> {formatDuration(\${varName}.runtime)}</span>
                 <span className="text-muted-foreground/30">&bull;</span>\` : ''}
                 <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-primary text-primary" strokeWidth={2} /> {\${varName}.rating || 'NR'}</span>
               </div>
               
               <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl drop-shadow-sm line-clamp-4 md:line-clamp-none">
                 {(\${varName} as any).shortTeaser || \${varName}.description}
               </p>

               <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                  <Button size="lg" className="rounded-pill px-8 gap-2 font-semibold bg-surface-elevated text-muted-foreground hover:bg-surface-elevated cursor-not-allowed border border-white/5 shadow-sm">
                     <Play className="w-4 h-4" strokeWidth={2} /> Streaming Coming Soon
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </div>

      \`;

  fs.writeFileSync(file, before + newHero + after);
}

updateHero('src/app/(main)/movies/[slug]/page.tsx', false);
updateHero('src/app/(main)/series/[slug]/page.tsx', true);
