import re

def update_hero(filepath, is_series):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    start_str = "{/* Movie Hero/Backdrop Layer */}" if not is_series else "{/* Series Hero/Backdrop Layer */}"
    end_str = "{/* Top Leaderboard Ad */}"

    start_idx = content.find(start_str)
    end_idx = content.find(end_str)

    if start_idx == -1 or end_idx == -1:
        print(f"Could not find boundaries in {filepath}")
        return

    before = content[:start_idx]
    after = content[end_idx:]

    var_name = 'series' if is_series else 'movie'
    label = 'Series' if is_series else 'Movie'
    
    runtime_html = f"""<span className="flex items-center gap-1.5"><Clock className="w-4 h-4" strokeWidth={{2}} /> {{formatDuration({var_name}.runtime)}}</span>
                 <span className="text-muted-foreground/30">&bull;</span>""" if not is_series else ""

    new_hero = f"""{{/* {label} Hero/Backdrop Layer */}}
      <div className="w-full relative bg-surface-overlay border-b border-white/5">
        <div className="w-full h-[50vh] md:h-[60vh] min-h-[400px] md:min-h-[500px] relative">
           <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10 h-full" />
           <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10 w-2/3" />
           
           {{({var_name} as any).backdropUrl || ({var_name} as any).imageUrl ? (
             <Image 
               src={{({var_name} as any).backdropUrl || ({var_name} as any).imageUrl}}
               alt={{{var_name}.title}}
               fill
               className="object-cover object-top z-0 opacity-40 md:opacity-50 mix-blend-screen"
               priority
             />
           ) : (
             <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 via-transparent to-transparent z-0 opacity-60" />
           )}}
        </div>
        
        <div className="relative z-20 max-w-[1920px] mx-auto px-6 md:px-10 -mt-32 md:-mt-48 pb-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-end">
            
            {{({var_name} as any).imageUrl && (
              <div className="w-40 md:w-64 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/10 relative z-30">
                <Image src={{({var_name} as any).imageUrl}} alt={{{var_name}.title}} fill className="object-cover" />
              </div>
            )}}
            
            <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-[1.1] tracking-tight text-balance drop-shadow-lg">
                 {{{var_name}.title}}
               </h1>
               
               <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-6 text-sm font-medium text-muted drop-shadow-md">
                 <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" strokeWidth={{2}} /> {{{var_name}.releaseDate ? new Date({var_name}.releaseDate).getFullYear() : 'TBA'}}</span>
                 <span className="text-muted-foreground/30">&bull;</span>
                 {runtime_html}
                 <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-primary text-primary" strokeWidth={{2}} /> {{{var_name}.rating || 'NR'}}</span>
               </div>
               
               <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl drop-shadow-sm line-clamp-4 md:line-clamp-none">
                 {{({var_name} as any).shortTeaser || {var_name}.description}}
               </p>

               <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                  <Button size="lg" className="rounded-pill px-8 gap-2 font-semibold bg-primary text-primary-foreground hover:scale-105 transition-apple shadow-lg border border-primary/20">
                     <Play className="w-4 h-4" fill="currentColor" /> Watch Trailer
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </div>

      """

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(before + new_hero + after)

update_hero('src/app/(main)/movies/[slug]/page.tsx', False)
update_hero('src/app/(main)/series/[slug]/page.tsx', True)
