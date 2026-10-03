import fs from 'fs';

const target = 'src/app/(main)/page.tsx';
let content = fs.readFileSync(target, 'utf8');

content = content.replace(
  /export default async function HomePage\(\) \{[\s\S]*?const jsonLd = \{/,
  `export default async function HomePage() {\n  let featuredMovies = await getFeaturedMovies(5);\n  let newReleases = await getLatestMovies(10);\n  let trendingMovies = await getTrendingMovies(3);\n  let topRatedMovies = await getTopRatedMovies(10);\n\n    const jsonLd = {`
);

fs.writeFileSync(target, content);
console.log("Forced replacement!");
