import fs from 'fs';

const target = 'src/app/(main)/page.tsx';
let content = fs.readFileSync(target, 'utf8');

// Replace button with Link
content = content.replace(
  /<button className="text-sm font-medium text-primary hover:text-primary-hover transition-apple">\n          See All\n        <\/button>/g,
  '<Link href={link} className="text-sm font-medium text-primary hover:text-primary-hover transition-apple">\n          See All\n        </Link>'
);

// Replace the grid container with a horizontal scrolling container
content = content.replace(
  /<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">/g,
  '<div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory hide-scrollbar w-full items-start">'
);

// We need to wrap MovieCard to give it a fixed width so it scrolls properly
// Current: {movies.map((movie) => (<MovieCard key={movie.id} ... />))}
content = content.replace(
  /\{movies\.map\(\(movie\) => \(\n          <MovieCard key=\{movie\.id\} \{\.\.\.movie\} primaryGenre=\{movie\.genres\?\.\[0\] \|\| 'Movie'\} imageUrl=\{\(movie as any\)\.imageUrl \|\| ""\} \/>\n        \)\)\}/g,
  `{movies.map((movie) => (
          <div key={movie.id} className="w-[160px] md:w-[200px] xl:w-[240px] shrink-0 snap-start">
            <MovieCard {...movie} primaryGenre={movie.genres?.[0] || 'Movie'} imageUrl={(movie as any).imageUrl || ""} />
          </div>
        ))}`
);

fs.writeFileSync(target, content);
console.log('Fixed StandardRow layout and See All links in page.tsx');
