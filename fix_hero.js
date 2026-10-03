import fs from 'fs';

let content = fs.readFileSync('src/components/home/HeroCarousel.tsx', 'utf8');

const regex = /<div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground font-medium mb-4 md:mb-6 drop-shadow-sm">[\s\S]*?<\/div>/;

const replacement = `<div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground font-medium mb-4 md:mb-6 drop-shadow-sm">
          <span>{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : new Date().getFullYear()}</span>
          <span>&bull;</span>
          <span>{movie.rating || "PG-13"}</span>
          <span>&bull;</span>
          <span>{movie.runtime ? formatDuration(movie.runtime) : "2h 20m"}</span>
        </div>`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/home/HeroCarousel.tsx', content);
