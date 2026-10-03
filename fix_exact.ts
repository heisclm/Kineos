import fs from 'fs';

const target = 'src/app/(main)/page.tsx';
let content = fs.readFileSync(target, 'utf8');

const search = `  let latestMovies = await getLatestMovies(18);
  let trendingMovies = await getTrendingMovies(3);
  let topRatedMovies = await getTopRatedMovies(5);`;

const replacement = `  let featuredMovies = await getFeaturedMovies(5);
  let newReleases = await getLatestMovies(10);
  let trendingMovies = await getTrendingMovies(3);
  let topRatedMovies = await getTopRatedMovies(10);`;

if (content.includes(search)) {
  content = content.replace(search, replacement);
  fs.writeFileSync(target, content);
  console.log("Successfully replaced exact string!");
} else {
  console.log("Could not find the exact string.");
}
