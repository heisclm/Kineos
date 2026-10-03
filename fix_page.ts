import fs from 'fs';

const target = 'src/app/(main)/page.tsx';
let content = fs.readFileSync(target, 'utf8');

// Replace the data fetching part
content = content.replace(
  /let latestMovies = await getLatestMovies\(\d+\);\n\s*let trendingMovies = await getTrendingMovies\(\d+\);\n\s*let topRatedMovies = await getTopRatedMovies\(\d+\);/,
  `let featuredMovies = await getFeaturedMovies(5);\n  let newReleases = await getLatestMovies(10);\n  let trendingMovies = await getTrendingMovies(5);\n  let topRatedMovies = await getTopRatedMovies(10);`
);

fs.writeFileSync(target, content);
console.log('Fixed page.tsx fetch variables');
